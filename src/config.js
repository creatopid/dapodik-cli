const BASE_URL = process.env.BASE_URL || "https://dapo.dikdasmen.go.id";
const DEFAULT_LEVEL = parseInt(process.env.DEFAULT_LEVEL || "0", 10);
const CACHE_TTL_HOURS = parseInt(process.env.CACHE_TTL || "24", 10);

export { BASE_URL, DEFAULT_LEVEL, CACHE_TTL_HOURS };
export default { BASE_URL, DEFAULT_LEVEL, CACHE_TTL_HOURS };
