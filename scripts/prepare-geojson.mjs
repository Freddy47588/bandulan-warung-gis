import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import area from "@turf/area";

const ROOT = process.cwd();
const LEGACY_DIR = path.join(ROOT, "map", "data");
const OUT_DIR = path.join(ROOT, "public", "data");

const DATASET_MAP = [
  { legacy: "LokasiWarung_11.js", output: "warungs.geojson", id: "warungs" },
  { legacy: "BatasKelurahan_1.js", output: "boundary.geojson", id: "boundary" },
  { legacy: "JalanDesa_10.js", output: "village-roads.geojson", id: "village-roads" },
  { legacy: "JalanPerumahan_9.js", output: "residential-roads.geojson", id: "residential-roads" },
  { legacy: "JalanGang_8.js", output: "alleys.geojson", id: "alleys" },
  { legacy: "Bangunan_4.js", output: "buildings.geojson", id: "buildings" },
  { legacy: "Pemukiman_2.js", output: "residential-areas.geojson", id: "residential-areas" },
  { legacy: "LahanTerbukaHijau_5.js", output: "green-spaces.geojson", id: "green-spaces" },
  { legacy: "Sekolah_3.js", output: "schools.geojson", id: "schools" },
  { legacy: "Pabrik_6.js", output: "factories.geojson", id: "factories" },
  { legacy: "Sungai_7.js", output: "rivers.geojson", id: "rivers" },
];

function readLegacySource(filename) {
  const localPath = path.join(LEGACY_DIR, filename);
  if (fs.existsSync(localPath)) {
    return fs.readFileSync(localPath, "utf8");
  }
  return execFileSync("git", ["show", `main:map/data/${filename}`], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function parseLegacyGeoJson(raw) {
  const stripped = raw.trim().replace(/^var\s+\w+\s*=\s*/, "").replace(/;\s*$/, "");
  const parsed = JSON.parse(stripped);
  delete parsed.crs;
  return parsed;
}

function deterministicHeight(seedValue, min = 5, max = 8.5) {
  const str = String(seedValue ?? "0");
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const normalized = (hash >>> 0) / 4294967295;
  return Number((min + normalized * (max - min)).toFixed(1));
}

function validateCoordinates(coords, filename) {
  if (typeof coords[0] === "number") {
    const [lng, lat] = coords;
    if (lng < 112.55 || lng > 112.65 || lat < -8.03 || lat > -7.94) {
      throw new Error(`Out-of-bounds coordinate [${lng}, ${lat}] in ${filename}`);
    }
    return;
  }
  for (const child of coords) {
    validateCoordinates(child, filename);
  }
}

function normalizeDataset(id, fc, auditLog) {
  const features = fc.features.map((feature, index) => {
    const props = { ...(feature.properties || {}) };

    if (!feature.geometry || !feature.geometry.coordinates) {
      throw new Error(`Null geometry found in ${id} feature #${index + 1}`);
    }
    validateCoordinates(feature.geometry.coordinates, id);

    if (id === "warungs") {
      if (props.Lokasi === "Warubg Yu Sri") {
        props.Lokasi = "Warung Yu Sri";
        auditLog.push(`warungs #${props.id}: fixed typo "Warubg Yu Sri" -> "Warung Yu Sri"`);
      }
      if (typeof props.Alamat === "string" && props.Alamat.includes("Jl. Bandulan Jl. Bandulan")) {
        props.Alamat = props.Alamat.replace("Jl. Bandulan Jl. Bandulan", "Jl. Bandulan");
        auditLog.push(`warungs #${props.id}: fixed duplicate "Jl. Bandulan" in address`);
      }
      if (typeof props.Alamat === "string" && props.Alamat.includes("Kabupaten Malang")) {
        props.Alamat = props.Alamat.replace("Kabupaten Malang", "Kota Malang");
        auditLog.push(`warungs #${props.id}: normalized "Kabupaten Malang" -> "Kota Malang"`);
      }
    }

    if (id === "residential-areas") {
      const sqm = Number(area(feature).toFixed(3));
      const ha = Number((sqm / 10000).toFixed(3));
      props.id = String(index + 1);
      props.Nama = `Zona Pemukiman ${index + 1}`;
      props.LuasMeter = sqm;
      props.LuasHektar = ha;
    }

    if (id === "buildings") {
      props.height = deterministicHeight(props.FID ?? index, 5.0, 8.5);
    }

    if (id === "schools") {
      props.height = 9.0;
    }

    if (id === "factories") {
      if (props.Nama === "PT, Berkat BusanaTama Garmindo") {
        props.Nama = "PT. Berkat Busana Tama Garmindo";
        auditLog.push(`factories #${props.id}: normalized punctuation in "${props.Nama}"`);
      }
      if (props.Nama === "PT.Indoflora Cipta Mandiri") {
        props.Nama = "PT. Indoflora Cipta Mandiri";
        auditLog.push(`factories #${props.id}: normalized spacing in "${props.Nama}"`);
      }
      props.height = 12.0;
    }

    if (id === "alleys" && typeof props.Nama === "string") {
      const original = props.Nama;
      if (original === "Jalab Bandulan 5B" || original === "Jalan Bandukan 5B") {
        props.Nama = "Jalan Bandulan 5B";
        auditLog.push(`alleys #${props.id}: fixed typo "${original}" -> "${props.Nama}"`);
      } else if (original === "Gg,1") {
        props.Nama = "Gg. 1";
        auditLog.push(`alleys #${props.id}: fixed punctuation "${original}" -> "${props.Nama}"`);
      }
    }

    return {
      type: "Feature",
      id: props.id ?? props.FID ?? String(index + 1),
      properties: props,
      geometry: feature.geometry,
    };
  });

  if (id === "residential-areas") {
    auditLog.push(`residential-areas: populated 15 sequential IDs and computed areas via Turf.js`);
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const auditLog = [];

for (const entry of DATASET_MAP) {
  const raw = readLegacySource(entry.legacy);
  const parsed = parseLegacyGeoJson(raw);
  const normalized = normalizeDataset(entry.id, parsed, auditLog);
  const outPath = path.join(OUT_DIR, entry.output);
  fs.writeFileSync(outPath, JSON.stringify(normalized), "utf8");
  console.log(`Generated ${entry.output}: ${normalized.features.length} features`);
}

console.log("\nNormalization audit:");
for (const line of auditLog) {
  console.log(` - ${line}`);
}
