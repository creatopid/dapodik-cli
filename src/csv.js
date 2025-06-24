import path from "path";
import fs from "fs/promises";

import context from "./context.js";
import logger from "./logger.js";

function toCSV(rows) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);

  const escapeCSV = (value) => {
    const str = String(value ?? "")
      .trim()
      .replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };

  const lines = rows.map((row) => headers.map((header) => escapeCSV(row[header])).join(","));

  return [headers.join(","), ...lines].join("\n");
}

async function saveCSV(name, rows) {
  const fileName = name.endsWith(".csv") ? name : `${name}.csv`;
  const filePath = path.join(context.outputDir, fileName);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const csvContent = toCSV(rows);
  await fs.writeFile(filePath, csvContent, "utf8");
  logger.info(`📄 Saved: ${filePath}`);
}

async function readCSV(name) {
  const fileName = name.endsWith(".csv") ? name : `${name}.csv`;
  const filePath = path.join(context.outputDir, fileName);

  try {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split(/\r?\n/).filter(Boolean);

    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row = {};

      headers.forEach((header, j) => {
        row[header] = values[j] ?? "";
      });

      rows.push(row);
    }

    return rows;
  } catch {
    return [];
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export { toCSV, saveCSV, readCSV };
export default { toCSV, saveCSV, readCSV };
