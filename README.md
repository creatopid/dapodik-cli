# dapodik-cli

A fast, modular CLI tool for education reference data scraping from DAPODIK and referensi.data.kemdikbud.go.id. Fetches Indonesian education region and school data (province, regency, district, school, detail) as clean CSV/JSON for analysis, automation, or research.

[![Node.js v22+](https://img.shields.io/badge/Node.js-v22%2B-brightgreen)](https://nodejs.org/) ![ESM](https://img.shields.io/badge/ESM-Enabled-blue) ![CLI](https://img.shields.io/badge/CLI-Tool-orange)

## Features

- 🎓 Access all Indonesian education data: province, city/regency, district, schools, school details (NPSN)
- 🔁 Multi-level recursive/incremental data pulling (can resume, skips if exists)
- 💾 Output as normalized, clean CSV or JSON (Excel, Python/R/Sheets ready)
- 🕹️ Flexible CLI: choose level, semester, education type, output dir
- 🧠 Supports all major education data types (PAUD, DIKDAS, DIKMEN, DIKTI) subject to API/source availability
- 📜 Logs to file and console (stack trace for errors)
- 🧰 100% ESM, Node.js v22+ ready

## Where is the Data From?

This CLI scrapes and fetches public data from:
- [https://dapo.dikdasmen.go.id/](https://dapo.dikdasmen.go.id/) (official Dapodik aggregate & progress API)
- [https://referensi.data.kemdikbud.go.id/](https://referensi.data.kemdikbud.go.id/) (school detail by NPSN)

The project is **NOT affiliated** with Kemdikbud. Data is for public, educational, and research use only.

## Quick Start

```bash
git clone https://github.com/daffaalam/dapodik-cli.git
cd dapodik-cli
npm install
node main.js [options]
```

## CLI Usage

| Option / Flag       | Description                                        | Example             |
|--------------------|----------------------------------------------------|----------------------|
| `-l`, `--level`    | Max depth to fetch (0–4)                           | `--level 2`          |
| `-s`, `--semester` | Semester ID (5 digits, e.g. `20231`)               | `--semester 20232`   |
| `-t`, `--type`     | Education type ID (for filtering schools)          | `--type smk`         |
| `-o`, `--output`   | Output directory (default: `./output`)             | `--output ./outdata` |

### Usage Examples

```sh
# Fetch all provinces and save as CSV
node main.js --level 0

# Fetch districts and schools for a semester, output to ./outdata
node main.js -l 3 -s 20232 -o ./outdata

# Fetch all school details (level 4)
node main.js --level 4
```

## Output Structure

```
/output/
  level-0.csv
  level-1.csv
  level-2.csv
  level-3/{province}/{regency}/{district}/district_code.csv
  level-4/{province}/{regency}/{district}/{npsn}.json
/logs/app.log
```

## Configuration

Config via `.env` or edit `src/config.js`:

| Key                | Description                | Default                      |
|--------------------|----------------------------|------------------------------|
| `BASE_URL`         | Dapodik API base URL       | https://dapo.dikdasmen.go.id |
| `DEFAULT_LEVEL`    | Default scrape depth       | 0                            |
| `CACHE_TTL`        | Cache expiry (hours)       | 24                           |

## Developer Guide

- **Modular codebase**: See `src/` for all logic (api, scraper, csv, logger, args, config, context)
- **Clean & robust**: ESM, async/await, file caching
- **Extendable**: Add endpoints, enrich scraping rules
- **Logs**: `/logs/app.log` contains all error/debug/info logs

## Disclaimer & License

- This is an unofficial and open project, not affiliated with Kemdikbud.
- Use for **educational, research, and non-commercial purposes only**.
- Scraping is subject to rate limits and website policy. Use responsibly.
- School detail scraping may break if HTML changes.
- Contributions, feedback, and issues are welcome via GitHub!
- No warranty, use at your own risk.

---

**Made with ❤️ by [@daffaalam](https://github.com/daffaalam)**
