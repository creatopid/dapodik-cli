import fs from "fs/promises";
import path from "path";

import api from "./src/api.js";
import args from "./src/args.js";
import csv from "./src/csv.js";
import scraper from "./src/scraper.js";
import logger from "./src/logger.js";
import context from "./src/context.js";

async function init() {
  logger.setMode({ file: false, console: true });

  context.logsDir = path.join(import.meta.dirname, context.logsDir);
  await fs.mkdir(context.logsDir, { recursive: true });

  context.outputDir = path.resolve(args.getAnyArg(["o", "output", "outputDir"], String, context.outputDir));
  await fs.mkdir(context.outputDir, { recursive: true });

  context.maxLevel = args.getAnyArg(["l", "level", "maxLevel"], Number, context.maxLevel);

  if (typeof context.maxLevel !== "number" || context.maxLevel < 0 || context.maxLevel > 4) {
    logger.error(`❌ Invalid or missing --level argument. Use --level 0|1|2|3|4`);
    process.exit(1);
  }

  context.semesterId =
    args.getAnyArg(["s", "semester", "semesterId"], String, context.semesterId) ?? (await api.getSemester());

  if (!/^\d{5}$/.test(context.semesterId)) {
    logger.error(`❌ Invalid semester ID format: ${context.semesterId}`);
    process.exit(1);
  }

  context.educationType = args.getAnyArg(["t", "type", "educationType"], String, context.educationType);

  logger.setMode({ file: true, console: true });
}

async function loadOrFetch(name, fetchFn, { type } = {}) {
  type = (type || path.parse(name).ext.slice(1) || "").toLowerCase();
  if (type == null || (type !== "csv" && type !== "json")) {
    throw new Error(`Invalid load type: ${type}. Expected "csv" or "json".`);
  }
  const fileName = name.endsWith(`.${type}`) ? name : `${name}.${type}`;
  const fullPath = path.join(context.outputDir, fileName);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  try {
    let data;
    let content;
    switch (type) {
      case "csv":
        data = await csv.readCSV(fileName);
        break;
      case "json":
        content = await fs.readFile(fullPath, "utf-8");
        data = JSON.parse(content);
        break;
    }
    if (!data || (Array.isArray(data) && data.length === 0)) throw new Error("Empty data");
    logger.info(`✅ Loaded ${Array.isArray(data) ? data.length : "object"} entries from ${fullPath}`);
    return data;
  } catch {
    const fresh = await fetchFn();
    if (fresh) {
      switch (type) {
        case "csv":
          await csv.saveCSV(fileName, fresh);
          break;
        case "json":
          await fs.writeFile(fullPath, JSON.stringify(fresh, null, 2), "utf-8");
          break;
      }
      logger.info(`💾 Saved ${type.toUpperCase()} to ${fullPath}`);
    }
    return fresh;
  }
}

function fetchLoopLevel(level, prevLevelData, filename) {
  return loadOrFetch(
    filename,
    async () => {
      const _data = [];
      let tryCount = 0;
      let success = 0;
      for (const wilayah of prevLevelData) {
        tryCount++;
        const data = await api.getRegion(level, wilayah.kode_wilayah, context.semesterId);
        if (data?.length) {
          _data.push(...data);
          success++;
        }
      }
      if (success < tryCount) logger.warn(`⚠️ Only ${success}/${tryCount} Level ${level} fetches returned data`);
      if (!_data.length) {
        logger.error(`❌ No Level ${level} data found.`);
        process.exit(1);
      }
      return _data;
    },
    { type: "csv" },
  );
}

async function fetchPerEntity(items, getPath, fetchFn, type) {
  function isValid(data, type) {
    if (type === "csv") return Array.isArray(data) && data.length;
    if (type === "json") return data && typeof data === "object" && Object.keys(data).length;
    return false;
  }
  type = type.toLowerCase();
  const result = [];
  let tryCount = 0;
  let success = 0;
  for (const item of items) {
    tryCount++;
    const name = getPath(item);
    const data = await loadOrFetch(name, () => fetchFn(item), { type });
    if (isValid(data, type)) {
      if (type === "csv") result.push(...data);
      if (type === "json") result.push(data);
      success++;
    }
  }
  if (success < tryCount) logger.warn(`⚠️ Only ${success}/${tryCount} fetches returned data`);
  if (!result.length) {
    logger.error(`❌ No data found.`);
    process.exit(1);
  }
  return result;
}

async function main() {
  let allLevel0 = [];
  let allLevel1 = [];
  let allLevel2 = [];
  let allLevel3 = [];
  let allLevel4 = [];

  allLevel0 = await loadOrFetch(
    "level-0",
    async () => {
      const data = await api.getRegion(0, "000000", context.semesterId);
      if (!data.length) {
        logger.error("❌ No Level 0 data found.");
        process.exit(1);
      }
      return data;
    },
    { type: "csv" },
  );

  if (context.maxLevel >= 1) allLevel1 = await fetchLoopLevel(1, allLevel0, "level-1");

  if (context.maxLevel >= 2) allLevel2 = await fetchLoopLevel(2, allLevel1, "level-2");

  if (context.maxLevel >= 3) {
    allLevel3 = await fetchPerEntity(
      allLevel2,
      (item) => {
        const provCode = item.kode_wilayah_induk_provinsi || item.kode_wilayah.substring(0, 2) + "0000";
        const kabCode = item.kode_wilayah_induk_kabupaten || item.kode_wilayah.substring(0, 4) + "00";
        return path.join("level-3", provCode, kabCode, item.kode_wilayah);
      },
      (item) => api.getProgressSP(item.kode_wilayah, context.semesterId, context.educationType),
      "csv",
    );
  }

  if (context.maxLevel >= 4) {
    allLevel4 = await fetchPerEntity(
      allLevel3,
      (item) =>
        path.join(
          "level-4",
          item.kode_wilayah_induk_provinsi,
          item.kode_wilayah_induk_kabupaten,
          item.kode_wilayah_induk_kecamatan,
          item.npsn,
        ),
      (item) => scraper.getInstitutionDetail(item.npsn),
      "json",
    );
  }

  logger.info("✅ Done.");
  if (allLevel0?.length) logger.info(`🔢 Level 0 count: ${allLevel0.length}`);
  if (allLevel1?.length) logger.info(`🔢 Level 1 count: ${allLevel1.length}`);
  if (allLevel2?.length) logger.info(`🔢 Level 2 count: ${allLevel2.length}`);
  if (allLevel3?.length) logger.info(`🔢 Level 3 count: ${allLevel3.length}`);
  if (allLevel4?.length) logger.info(`🔢 Level 4 count: ${allLevel4.length}`);
  if (context.maxLevel >= 3) {
    logger.info(`📚 Education type: ${context.educationType || "(all types)"}`);
  }
  logger.info(`📅 Semester ID: ${context.semesterId}`);
  logger.info(`📂 Output directory: ${context.outputDir}`);
}

async function app() {
  try {
    await init();
    await main();
  } catch (err) {
    logger.error(`❌ Uncaught Error: ${err.message}`);
    process.exit(1);
  }
}

app();
