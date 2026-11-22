import fs from "node:fs";
import path from "node:path";
import area from "@turf/area";
import booleanIntersects from "@turf/boolean-intersects";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import centroid from "@turf/centroid";
import distance from "@turf/distance";
import { lineString, point, polygon } from "@turf/helpers";
import length from "@turf/length";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "public", "data");
const BOUNDARY_FC = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "boundary.geojson"), "utf8"));
const BOUNDARY = BOUNDARY_FC.features[0];

function round6(n) {
  return Math.round(n * 1e6) / 1e6;
}

function roundCoords(coords) {
  if (typeof coords[0] === "number") {
    return [round6(coords[0]), round6(coords[1])];
  }
  return coords.map(roundCoords);
}

function deterministicHeight(seedValue, min = 4.6, max = 8.2) {
  const str = String(seedValue ?? "0");
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const normalized = (hash >>> 0) / 4294967295;
  return Number((min + normalized * (max - min)).toFixed(1));
}

function inferWarungCategory(name = "", tags = {}) {
  const lower = name.toLowerCase();
  const shop = tags.shop || "";
  const amenity = tags.amenity || "";

  if (shop === "greengrocer" || lower.includes("sayur") || lower.includes("buah")) {
    return "produce";
  }
  if (
    amenity === "cafe" ||
    shop === "coffee" ||
    shop === "beverages" ||
    lower.includes("kopi") ||
    lower.includes("coffee") ||
    lower.includes("cafe") ||
    lower.includes("kafe") ||
    lower.includes("warkop") ||
    lower.includes("es ") ||
    lower.includes("minum")
  ) {
    return "cafe";
  }
  if (
    ["convenience", "general", "grocery", "supermarket", "kiosk"].includes(shop) ||
    lower.includes("toko") ||
    lower.includes("sembako") ||
    lower.includes("kelontong") ||
    lower.includes("mart") ||
    lower.includes("kios") ||
    lower.includes("pracangan")
  ) {
    return "grocery";
  }
  return "food";
}

function formatOsmAddress(tags = {}) {
  const parts = [];
  if (tags["addr:street"]) {
    parts.push(
      tags["addr:housenumber"]
        ? `${tags["addr:street"]} No. ${tags["addr:housenumber"]}`
        : tags["addr:street"],
    );
  }
  parts.push("Bandulan, Kec. Sukun, Kota Malang, Jawa Timur 65146");
  return parts.join(", ");
}

function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function fetchOsmTiles() {
  const minLng = 112.589;
  const maxLng = 112.613;
  const minLat = -7.997;
  const maxLat = -7.972;
  const cols = 3;
  const rows = 3;
  const dLng = (maxLng - minLng) / cols;
  const dLat = (maxLat - minLat) / rows;

  const nodes = new Map();
  const ways = new Map();

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const w = round6(minLng + c * dLng);
      const e = round6(minLng + (c + 1) * dLng);
      const s = round6(minLat + r * dLat);
      const n = round6(minLat + (r + 1) * dLat);
      const url = `https://api.openstreetmap.org/api/0.6/map.json?bbox=${w},${s},${e},${n}`;
      const label = `tile[${r},${c}]`;

      let data = null;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "BandulanWarungGIS/2.1 (portfolio-project)" },
            signal: AbortSignal.timeout(25000),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          data = await res.json();
          break;
        } catch (err) {
          console.warn(`  ${label} attempt ${attempt} failed: ${err.message}`);
          await new Promise((ok) => setTimeout(ok, 1500 * attempt));
        }
      }

      if (!data) throw new Error(`Failed to fetch ${label}`);
      for (const el of data.elements ?? []) {
        if (el.type === "node") nodes.set(el.id, el);
        else if (el.type === "way") ways.set(el.id, el);
      }
      console.log(`Fetched ${label}: ${data.elements?.length ?? 0} elements`);
    }
  }

  return { nodes, ways };
}

function wayToCoords(way, nodes) {
  const coords = [];
  for (const nid of way.nodes ?? []) {
    const nd = nodes.get(nid);
    if (!nd) continue;
    coords.push([round6(nd.lon), round6(nd.lat)]);
  }
  return coords;
}

const VALID_HIGHWAYS = new Set([
  "primary",
  "secondary",
  "tertiary",
  "unclassified",
  "residential",
  "living_street",
  "service",
  "pedestrian",
  "footway",
  "path",
  "track",
]);

const WARUNG_AMENITIES = new Set(["restaurant", "fast_food", "cafe", "food_court"]);
const WARUNG_SHOPS = new Set([
  "convenience",
  "greengrocer",
  "bakery",
  "general",
  "grocery",
  "supermarket",
  "kiosk",
  "beverages",
  "coffee",
  "pastry",
]);
const SUPPORT_AMENITIES = new Set([
  "place_of_worship",
  "clinic",
  "hospital",
  "doctors",
  "pharmacy",
  "community_centre",
  "townhall",
  "marketplace",
  "fuel",
  "bank",
  "school",
  "kindergarten",
]);

async function main() {
  const { nodes, ways } = await fetchOsmTiles();
  console.log(`\nMerged unique OSM objects: ${nodes.size} nodes, ${ways.size} ways`);

  const villageRoads = [];
  const residentialRoads = [];
  const alleys = [];
  const buildings = [];
  const osmPoiCandidates = [];
  const osmAmenityCandidates = [];

  // Process ways (roads, buildings, building-tagged POIs/amenities)
  for (const way of ways.values()) {
    const tags = way.tags || {};
    const coords = wayToCoords(way, nodes);
    if (coords.length < 2) continue;

    // 1. Roads
    if (tags.highway && VALID_HIGHWAYS.has(tags.highway)) {
      const line = lineString(coords);
      if (booleanIntersects(line, BOUNDARY)) {
        const mid = coords[Math.floor(coords.length / 2)];
        const startIn = booleanPointInPolygon(point(coords[0]), BOUNDARY);
        const endIn = booleanPointInPolygon(point(coords[coords.length - 1]), BOUNDARY);
        const midIn = booleanPointInPolygon(point(mid), BOUNDARY);
        if (startIn || endIn || midIn) {
          const hw = tags.highway;
          const roadName = tags.name?.trim() || null;
          const lenM = Number(length(line, { units: "meters" }).toFixed(1));
          const lenKm = Number((lenM / 1000).toFixed(3));
          const feature = {
            type: "Feature",
            id: `osm-way-${way.id}`,
            properties: {
              id: `osm-${way.id}`,
              Nama: roadName,
              highway: hw,
              source: "osm",
              PanjangM: lenM,
              PanjangKM: lenKm,
            },
            geometry: { type: "LineString", coordinates: coords },
          };

          const isMainArterialName =
            roadName &&
            /^(jalan|jl\.?)\s+(raya\s+)?bandulan(\s+barat)?$/i.test(roadName);

          if (
            ["primary", "secondary", "tertiary", "unclassified"].includes(hw) ||
            isMainArterialName
          ) {
            villageRoads.push(feature);
          } else if (hw === "residential") {
            residentialRoads.push(feature);
          } else {
            alleys.push(feature);
          }
        }
      }
    }

    // 2. Clean OSM Buildings (replacing messy GeoAI polygons)
    if (tags.building && coords.length >= 4) {
      const ring = [...coords];
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push([...ring[0]]);
      }
      if (ring.length >= 4) {
        const poly = polygon([ring]);
        const center = centroid(poly);
        if (booleanPointInPolygon(center, BOUNDARY)) {
          const sqm = area(poly);
          if (sqm >= 10 && sqm <= 35000) {
            const levels = Number(tags["building:levels"]);
            const height =
              Number.isFinite(levels) && levels >= 1 && levels <= 12
                ? Number((levels * 3.2).toFixed(1))
                : deterministicHeight(way.id, 4.5, 8.0);
            buildings.push({
              type: "Feature",
              id: `osm-bldg-${way.id}`,
              properties: {
                FID: String(way.id),
                height,
                buildingType: tags.building !== "yes" ? tags.building : "residential",
                source: "osm",
              },
              geometry: { type: "Polygon", coordinates: [ring] },
            });
          }

          // Also collect POI/Amenity tags sitting on building ways
          const c = center.geometry.coordinates;
          if (WARUNG_AMENITIES.has(tags.amenity) || WARUNG_SHOPS.has(tags.shop)) {
            osmPoiCandidates.push({ id: `way-${way.id}`, lon: c[0], lat: c[1], tags });
          }
          if (SUPPORT_AMENITIES.has(tags.amenity)) {
            osmAmenityCandidates.push({ id: `way-${way.id}`, lon: c[0], lat: c[1], tags });
          }
        }
      }
    } else if (
      (WARUNG_AMENITIES.has(tags.amenity) ||
        WARUNG_SHOPS.has(tags.shop) ||
        SUPPORT_AMENITIES.has(tags.amenity)) &&
      coords.length >= 3
    ) {
      const ring = [...coords];
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push([...ring[0]]);
      }
      const center = centroid(polygon([ring]));
      if (booleanPointInPolygon(center, BOUNDARY)) {
        const c = center.geometry.coordinates;
        if (WARUNG_AMENITIES.has(tags.amenity) || WARUNG_SHOPS.has(tags.shop)) {
          osmPoiCandidates.push({ id: `way-${way.id}`, lon: c[0], lat: c[1], tags });
        }
        if (SUPPORT_AMENITIES.has(tags.amenity)) {
          osmAmenityCandidates.push({ id: `way-${way.id}`, lon: c[0], lat: c[1], tags });
        }
      }
    }
  }

  // Process nodes (POIs & Supporting Amenities)
  for (const nd of nodes.values()) {
    const tags = nd.tags;
    if (!tags) continue;
    const isWarung = WARUNG_AMENITIES.has(tags.amenity) || WARUNG_SHOPS.has(tags.shop);
    const isAmenity = SUPPORT_AMENITIES.has(tags.amenity);
    if (!isWarung && !isAmenity) continue;

    const pt = point([round6(nd.lon), round6(nd.lat)]);
    if (!booleanPointInPolygon(pt, BOUNDARY)) continue;

    if (isWarung) osmPoiCandidates.push({ id: `node-${nd.id}`, lon: round6(nd.lon), lat: round6(nd.lat), tags });
    if (isAmenity) osmAmenityCandidates.push({ id: `node-${nd.id}`, lon: round6(nd.lon), lat: round6(nd.lat), tags });
  }

  // Merge Warungs: preserve all 10 normalized QGIS survey warungs + add deduplicated real OSM warungs/shops
  const qgisWarungsRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "warungs.geojson"), "utf8"));
  const baseQgisWarungs = qgisWarungsRaw.features
    .filter((f) => f.properties.source !== "osm")
    .map((f) => ({
      type: "Feature",
      id: String(f.properties.id),
      properties: {
        id: String(f.properties.id),
        Lokasi: f.properties.Lokasi,
        Alamat: f.properties.Alamat,
        source: "qgis",
        category: inferWarungCategory(f.properties.Lokasi),
      },
      geometry: {
        type: "Point",
        coordinates: roundCoords(f.geometry.coordinates),
      },
    }));

  const mergedWarungs = [...baseQgisWarungs];
  let nextWarungId = baseQgisWarungs.length + 1;

  for (const cand of osmPoiCandidates) {
    const name = cand.tags.name?.trim();
    if (!name) continue;
    const pt = point([round6(cand.lon), round6(cand.lat)]);
    const norm = normalizeName(name);
    const isDup = mergedWarungs.some(
      (ex) =>
        normalizeName(ex.properties.Lokasi) === norm ||
        distance(pt, ex, { units: "meters" }) < 28,
    );
    if (isDup) continue;

    mergedWarungs.push({
      type: "Feature",
      id: String(nextWarungId),
      properties: {
        id: String(nextWarungId),
        Lokasi: name,
        Alamat: formatOsmAddress(cand.tags),
        source: "osm",
        category: inferWarungCategory(name, cand.tags),
      },
      geometry: {
        type: "Point",
        coordinates: [round6(cand.lon), round6(cand.lat)],
      },
    });
    nextWarungId += 1;
  }

  // Build Supporting Amenities (deduplicated against existing QGIS schools)
  const schoolsFc = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "schools.geojson"), "utf8"));
  const existingSchoolCenters = schoolsFc.features.map((f) => ({
    name: normalizeName(f.properties.Nama),
    center: centroid(f),
  }));

  const amenities = [];
  const seenAmenity = new Set();

  for (const cand of osmAmenityCandidates) {
    const am = cand.tags.amenity;
    const rawName = cand.tags.name?.trim();
    const pt = point([round6(cand.lon), round6(cand.lat)]);

    let amenityType = "civic";
    let fallbackLabel = "Fasilitas Publik";
    if (am === "place_of_worship") {
      amenityType = "worship";
      fallbackLabel = cand.tags.religion === "christian" ? "Gereja" : "Masjid / Mushola";
    } else if (["clinic", "hospital", "doctors", "pharmacy"].includes(am)) {
      amenityType = "health";
      fallbackLabel = am === "pharmacy" ? "Apotek" : "Fasilitas Kesehatan";
    } else if (["school", "kindergarten"].includes(am)) {
      const dupSchool = existingSchoolCenters.some(
        (s) =>
          (rawName && s.name === normalizeName(rawName)) ||
          distance(pt, s.center, { units: "meters" }) < 60,
      );
      if (dupSchool) continue;
      amenityType = "education";
      fallbackLabel = am === "kindergarten" ? "TK / PAUD" : "Sekolah";
    } else if (am === "marketplace") {
      fallbackLabel = "Pasar";
    } else if (am === "townhall" || am === "community_centre") {
      fallbackLabel = "Balai / Kantor Publik";
    } else if (am === "fuel") {
      fallbackLabel = "SPBU / Pertamini";
    } else if (am === "bank") {
      fallbackLabel = "Bank";
    }

    const name = rawName || fallbackLabel;
    const key = `${amenityType}:${normalizeName(name)}:${cand.lon.toFixed(4)},${cand.lat.toFixed(4)}`;
    if (seenAmenity.has(key)) continue;
    seenAmenity.add(key);

    amenities.push({
      type: "Feature",
      id: `osm-am-${cand.id}`,
      properties: {
        id: String(amenities.length + 1),
        Nama: name,
        amenityType,
        osmTag: am,
        source: "osm",
      },
      geometry: {
        type: "Point",
        coordinates: [round6(cand.lon), round6(cand.lat)],
      },
    });
  }

  const writeFc = (filename, features) => {
    const outPath = path.join(DATA_DIR, filename);
    const json = JSON.stringify({ type: "FeatureCollection", features });
    fs.writeFileSync(outPath, json, "utf8");
    console.log(`Wrote ${filename.padEnd(28)} ${String(features.length).padStart(5)} features (${(json.length / 1024).toFixed(1)} KB)`);
  };

  console.log("\n=== SUMMARY ===");
  writeFc("village-roads.geojson", villageRoads);
  writeFc("residential-roads.geojson", residentialRoads);
  writeFc("alleys.geojson", alleys);
  writeFc("buildings.geojson", buildings);
  writeFc("warungs.geojson", mergedWarungs);
  writeFc("amenities.geojson", amenities);

  const catSummary = mergedWarungs.reduce((acc, f) => {
    const k = `${f.properties.source}:${f.properties.category}`;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const amSummary = amenities.reduce((acc, f) => {
    acc[f.properties.amenityType] = (acc[f.properties.amenityType] || 0) + 1;
    return acc;
  }, {});
  console.log("Warungs breakdown:", catSummary);
  console.log("Amenities breakdown:", amSummary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
