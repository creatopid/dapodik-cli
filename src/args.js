function getArgs() {
  const argv = process.argv.slice(2);
  const args = {};

  const addArgValue = (target, key, value) => {
    if (key in target) {
      if (Array.isArray(target[key])) {
        target[key].push(value);
      } else {
        target[key] = [target[key], value];
      }
    } else {
      target[key] = value;
    }
  };

  for (let i = 0; i < argv.length; i++) {
    let raw = argv[i];
    if (!raw.startsWith("-")) continue;

    raw = raw.replace(/^-{1,2}/, "");
    const [keyRaw, valueRaw] = raw.split("=");
    const key = keyRaw.toLowerCase();

    if (valueRaw !== undefined) {
      addArgValue(args, key, valueRaw);
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith("-")) {
      addArgValue(args, key, true);
    } else {
      addArgValue(args, key, next);
      i++;
    }
  }

  return args;
}

function getArg(key, Type = String, fallback = null) {
  const args = getArgs();
  const rawValue = args[key.toLowerCase()];
  if (rawValue === undefined) return fallback;

  const rawValues = Array.isArray(rawValue) ? rawValue : [rawValue];

  const values = rawValues
    .flatMap((val) => (typeof val === "string" ? val.split(",") : [val]))
    .map((val) => (typeof val === "string" ? val.trim() : val))
    .filter((val) => val !== "");

  if (Type === Array) {
    return values.length ? values : fallback;
  }

  const parsedValues = values
    .map((val) => {
      if (Type === Boolean) {
        const str = String(val).toLowerCase();
        if (["true", "1", "yes", "y", "on"].includes(str)) return true;
        if (["false", "0", "no", "n", "off"].includes(str)) return false;
        return Boolean(val);
      }

      if (Type === Number) {
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      }

      if (Type === String) {
        return String(val);
      }

      if (typeof Type === "function") {
        try {
          return Type(val);
        } catch {
          return undefined;
        }
      }

      return val;
    })
    .filter((val) => val !== undefined);

  if (parsedValues.length === 0 || parsedValues.every((v) => v === "")) {
    return fallback;
  }

  return parsedValues.length === 1 ? parsedValues[0] : parsedValues;
}

function getAnyArg(keys, Type = String, fallback = null) {
  for (const key of keys) {
    const val = getArg(key, Type);
    if (val != null) return val;
  }
  return fallback;
}

export { getArgs, getArg, getAnyArg };
export default { getArgs, getArg, getAnyArg };
