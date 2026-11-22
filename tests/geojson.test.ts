import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const DATA_DIR = path.resolve(process.cwd(), "public", "data");

const EXPECTED_MIN_COUNTS: Record<string, number> = {
  "warungs.geojson": 30,
  "boundary.geojson": 1,
  "village-roads.geojson": 5,
  "residential-roads.geojson": 150,
  "alleys.geojson": 300,
  "buildings.geojson": 2000,
  "residential-areas.geojson": 15,
  "green-spaces.geojson": 4,
  "schools.geojson": 6,
  "factories.geojson": 5,
  "amenities.geojson": 40,
  "rivers.geojson": 2,
};

describe("Enriched Bandulan GeoJSON integrity", () => {
  it("contains all 12 valid RFC 7946 GeoJSON datasets with complete coverage", () => {
    for (const [file, minCount] of Object.entries(EXPECTED_MIN_COUNTS)) {
      const fullPath = path.join(DATA_DIR, file);
      expect(fs.existsSync(fullPath), `Missing ${file}`).toBe(true);

      const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      expect(parsed.type).toBe("FeatureCollection");
      expect(parsed.crs).toBeUndefined();
      expect(parsed.features.length).toBeGreaterThanOrEqual(minCount);

      for (const feature of parsed.features) {
        expect(feature.type).toBe("Feature");
        expect(feature.geometry).toBeTruthy();
        expect(feature.geometry.coordinates).toBeTruthy();
      }
    }
  });

  it("preserves all 10 normalized QGIS survey warungs alongside real OSM warungs", () => {
    const warungs = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "warungs.geojson"), "utf8"));
    const qgis = warungs.features.filter((f: { properties: { source: string } }) => f.properties.source === "qgis");
    const osm = warungs.features.filter((f: { properties: { source: string } }) => f.properties.source === "osm");
    const names = warungs.features.map((f: { properties: { Lokasi: string } }) => f.properties.Lokasi);

    expect(qgis).toHaveLength(10);
    expect(osm.length).toBeGreaterThanOrEqual(20);
    expect(names).toContain("Warung Yu Sri");
    expect(names).not.toContain("Warubg Yu Sri");
  });

  it("uses clean OSM building footprints with 3D heights instead of jagged GeoAI blobs", () => {
    const buildings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "buildings.geojson"), "utf8"));
    expect(buildings.features.length).toBeGreaterThan(2500);
    const vertexCounts = buildings.features.map(
      (f: { geometry: { coordinates: number[][][] } }) => f.geometry.coordinates[0].length,
    );
    const medianVertices = vertexCounts.sort((a: number, b: number) => a - b)[
      Math.floor(vertexCounts.length / 2)
    ];
    // Clean OSM footprints have median ~5 vertices (rectangles), unlike GeoAI's median 43
    expect(medianVertices).toBeLessThanOrEqual(10);
  });

  it("contains categorized supporting public amenities inside Bandulan", () => {
    const amenities = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "amenities.geojson"), "utf8"));
    const types = new Set(amenities.features.map((f: { properties: { amenityType: string } }) => f.properties.amenityType));
    expect(types.has("worship")).toBe(true);
    expect(types.has("health")).toBe(true);
    expect(types.has("civic")).toBe(true);
  });
});
