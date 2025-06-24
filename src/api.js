import fs from "fs/promises";
import path from "path";

import config from "./config.js";
import context from "./context.js";
import logger from "./logger.js";

async function getSemester() {
  const filePath = path.join(context.outputDir, "var.txt");
  const now = new Date();

  try {
    const cached = await fs.readFile(filePath, "utf8");
    const semesterId = cached.trim();
    if (/^\d{5}$/.test(semesterId)) return semesterId;
    throw new Error("Invalid format in cache");
  } catch {
    // ignore: not found or invalid, will fetch
  }

  try {
    const url = `${config.BASE_URL}/assets/js/var.txt`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const semesterId = text.trim();
    if (!/^\d{5}$/.test(semesterId)) {
      throw new Error("Invalid semester_id from server");
    }

    await fs.writeFile(filePath, semesterId);
    return semesterId;
  } catch {
    const year = now.getFullYear();
    const fallbackId = now.getMonth() < 6 ? `${year - 1}2` : `${year}1`;
    return fallbackId;
  }
}

async function getRegion(level, regionCode, semesterId, waitMs) {
  return await fetchWithRetry("/rekap/dataSekolah", level, regionCode, semesterId, {}, waitMs);
}

async function getProgressSP(regionCode, semesterId, educationType, waitMs) {
  return await fetchWithRetry(
    "/rekap/progresSP",
    3,
    regionCode,
    semesterId,
    { bentuk_pendidikan_id: educationType ?? "" },
    waitMs,
  );
}

async function fetchWithRetry(endpoint, level, regionCode, semesterId, otherParams, waitMs = 500) {
  const url = new URL(`${config.BASE_URL}${endpoint}`);
  Object.entries(otherParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  url.searchParams.set("id_level_wilayah", level);
  url.searchParams.set("kode_wilayah", regionCode);
  url.searchParams.set("semester_id", semesterId);
  const referrer =
    (!level || level === 0) && (!regionCode || regionCode === "000000")
      ? `${config.BASE_URL}/sp`
      : `${config.BASE_URL}/sp/${level}/${regionCode}`;
  const headers = {
    "User-Agent": `NodeJS/${Math.floor(Math.random() * 1e6) + 1e5}`,
    Referer: referrer,
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        } else {
          logger.error(`❌ Fetch failed [${regionCode}] Level ${level}: ${response.status} ${response.statusText}`);
          logger.file("debug", `URL: ${url.toString()}`);
          logger.file("debug", `Header: ${headers}`);
          return [];
        }
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
        throw new Error("Invalid JSON structure", { cause: data });
      }

      const result = data.map(cleanObject);
      logger.info(`✅ Fetched ${result.length} entries [${regionCode}] Level ${level}`);
      await delay(waitMs);
      return result;
    } catch (err) {
      logger.warn(`⚠️ Retry ${attempt}/3 [${regionCode}] Level ${level}: ${err.message}`);
      if (attempt === 3) {
        logger.error(`❌ Fetch failed after 3 attempts [${regionCode}] Level ${level}`);
        logger.error(err);
        logger.file("debug", `URL: ${url.toString()}`);
        logger.file("debug", `Header: ${headers}`);
        return [];
      }
      await delay(1000 * attempt);
    }
  }
}

function cleanObject(obj) {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = typeof val === "string" ? val.trim() : val;
  }
  return result;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { getSemester, getRegion, getProgressSP };
export default { getSemester, getRegion, getProgressSP };
