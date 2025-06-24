function toCamelCase_(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)
    .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join("");
}

function cleanValue_(value) {
  const clean = value.trim();
  return clean === "" || clean === "-" ? null : clean;
}

async function getInstitutionDetail(npsn) {
  const url = `https://referensi.data.kemdikbud.go.id/pendidikan/npsn/${npsn}`;
  const response = await fetch(url);
  const html = await response.text();

  const detail = {};

  const tabNameMatches = [...html.matchAll(/<label[^>]*>(.*?)<\/label>/g)];
  const tabNames = tabNameMatches.map((m) => toCamelCase_(m[1]));

  const tabBlocks = [...html.matchAll(/<div class="tabby-content">([\s\S]*?)<\/div>/g)];

  for (let i = 0; i < tabBlocks.length; i++) {
    const block = tabBlocks[i]?.[1] || "";
    const tabName = tabNames[i] || `tab${i}`;
    const tabData = {};
    let lastLabel = null;

    const rows = [...block.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
    for (const row of rows) {
      const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)];
      if (cells.length >= 4) {
        const labelRaw = cells[1][1]
          .replace(/<[^>]*>/g, "")
          .trim()
          .replace(":", "");
        const valueRaw = cells[3][1].replace(/<[^>]*>/g, "").trim();
        const value = cleanValue_(valueRaw);

        if (labelRaw) {
          lastLabel = toCamelCase_(labelRaw);

          if (lastLabel === "aksesInternet" && value) {
            tabData.aksesInternet = [];
            if (value) {
              tabData.aksesInternet.push(value.replace(/^\d+\.\s*/, "").trim());
            }
          } else {
            tabData[lastLabel] = value;
          }
        } else if (lastLabel === "aksesInternet" && value) {
          if (!tabData.aksesInternet) tabData.aksesInternet = [];
          tabData.aksesInternet.push(value.replace(/^\d+\.\s*/, "").trim());
        }
      }
    }

    if (tabName.includes("peta")) {
      const text = block.replace(/<[^>]*>/g, " ");
      const lat = text.match(/Lintang:\s*(-?\d+\.\d+)/)?.[1] || null;
      const lng = text.match(/Bujur:\s*(-?\d+\.\d+)/)?.[1] || null;
      tabData.lintang = lat;
      tabData.bujur = lng;
    }

    detail[tabName] = tabData;
  }

  return detail;
}

export { getInstitutionDetail };
export default { getInstitutionDetail };
