import fs from "fs/promises";
import path from "path";

import context from "./context.js";

const config = {
  console: true,
  file: true,
};

function formatMessage(level, args, includeStack = false) {
  return (
    `[${new Date().toISOString()}] [${level.toUpperCase()}] ` +
    args
      .map((arg) => (arg instanceof Error ? (includeStack ? arg.stack || arg.message : arg.message) : String(arg)))
      .join(" ")
  );
}

function writeLog(level, ...args) {
  if (!args.length) return;
  if (config.console) (console[level] || console.log)(formatMessage(level, args));
  if (config.file) logToFile(level, ...args);
}

async function logToFile(level, ...args) {
  level ||= "FILE";
  if (!args.length) return;
  try {
    await fs.appendFile(path.join(context.logsDir, "app.log"), formatMessage(level, args, true) + "\n", "utf8");
  } catch (err) {
    console.error("❌ Failed to write debug log to file:", err.message);
  }
}

const logger = {};
logger.file = logToFile;
["log", "info", "warn", "error", "debug"].forEach((level) => {
  logger[level] = (...args) => writeLog(level, ...args);
});

function setMode({ file, console }) {
  if (typeof file === "boolean") config.file = file;
  if (typeof console === "boolean") config.console = console;
}

export const { file, log, info, warn, error, debug } = logger;
export { setMode };
export default { ...logger, setMode };
