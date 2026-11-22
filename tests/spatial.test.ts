import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LAYER_CATALOG } from "../src/data/layers";
import { computeCatchment } from "../src/spatial/catchment";
import { enrichWarungs } from "../src/spatial/enrichment";
import { computeSpatialInsights } from "../src/spatial/insights";
import { computeMeasurement } from "../src/spatial/measure";
import { findNearestWarung } from "../src/spatial/nearest";
import { buildRoadGraph } from "../src/spatial/routing";
import { buildGlobalSearchIndex, searchGlobalIndex } from "../src/spatial/search";
import { computeVoronoiAnalysis } from "../src/spatial/voronoi";
import type { BandulanDatasets, LayerId } from "../src/types/geo";

function loadLocalDatasets(): BandulanDatasets {
  const dataDir = path.resolve(process.cwd(), "public", "data");
  const entries = LAYER_CATALOG.map((meta) => [
    meta.id,
    JSON.parse(fs.readFileSync(path.join(dataDir, meta.file), "utf8")),
  ]);
  return Object.fromEntries(entries) as unknown as BandulanDatasets;
}

describe("Turf.js Spatial Intelligence & Road Routing Engine", () => {
  const datasets = loadLocalDatasets();
  const warungs = enrichWarungs(datasets);
  const roadGraph = buildRoadGraph(datasets);

  it("enriches all warungs with factual metrics including supporting facilities and OSM buildings", () => {
    expect(warungs.length).toBeGreaterThanOrEqual(30);
    for (const w of warungs) {
      expect(w.nearestRoad.distanceMeters).toBeGreaterThanOrEqual(0);
      expect(w.nearestSchool.distanceMeters).toBeGreaterThan(0);
      expect(w.nearestAmenity.distanceMeters).toBeGreaterThan(0);
      expect(w.nearestWarung.distanceMeters).toBeGreaterThan(0);
      expect(w.buildingsWithin250m).toBeGreaterThan(0);
    }
  });

  it("computes monotonic catchment counts including buildings and supporting amenities", () => {
    const sample = warungs[2];
    const c100 = computeCatchment(sample, 100, datasets);
    const c250 = computeCatchment(sample, 250, datasets);
    const c500 = computeCatchment(sample, 500, datasets);

    expect(c100.counts.buildings).toBeLessThanOrEqual(c250.counts.buildings);
    expect(c250.counts.buildings).toBeLessThanOrEqual(c500.counts.buildings);
    expect(c500.counts.buildings).toBeGreaterThan(100);
    expect(c500.counts.amenities).toBeGreaterThan(0);
  });

  it("computes real client-side Dijkstra road routes alongside straight-line fallback", () => {
    expect(roadGraph.coords.length).toBeGreaterThan(1000);
    const testPoint: [number, number] = [112.604, -7.983];

    const viaRoad = findNearestWarung(testPoint, warungs, "click", "road", roadGraph);
    const straight = findNearestWarung(testPoint, warungs, "click", "straight", roadGraph);

    expect(viaRoad.viaRoad).toBe(true);
    expect(viaRoad.line.geometry.coordinates.length).toBeGreaterThan(2);
    expect(viaRoad.nearest.distanceMeters).toBeGreaterThanOrEqual(straight.nearest.distanceMeters - 5);
    expect(viaRoad.topThree).toHaveLength(3);
    expect(straight.viaRoad).toBe(false);
    expect(straight.line.geometry.coordinates).toHaveLength(2);
  });

  it("generates clipped Voronoi territories across all warungs summing to ~100% of Bandulan", () => {
    const vor = computeVoronoiAnalysis(warungs, datasets);
    expect(vor.territories.features.length).toBe(warungs.length);

    const totalShare = vor.territories.features.reduce(
      (sum, f) => sum + f.properties.sharePercent,
      0,
    );
    expect(totalShare).toBeGreaterThan(95);
    expect(totalShare).toBeLessThanOrEqual(102);
    expect(vor.underservedZones.features.length).toBeGreaterThan(0);
  });

  it("aggregates spatial insights accurately across all 12 enriched layers", () => {
    const ins = computeSpatialInsights(datasets);
    expect(ins.boundaryAreaHa).toBeGreaterThan(220);
    expect(ins.warungCount).toBe(warungs.length);
    expect(ins.qgisWarungCount).toBe(10);
    expect(ins.osmWarungCount).toBeGreaterThanOrEqual(20);
    expect(ins.totalRoadKm).toBeGreaterThan(30);
    expect(ins.amenityCount).toBeGreaterThanOrEqual(40);
    expect(ins.amenityBreakdown.length).toBeGreaterThanOrEqual(3);
  });

  it("supports global search across warungs, roads, schools, factories, and amenities", () => {
    const idx = buildGlobalSearchIndex(warungs, datasets);
    expect(searchGlobalIndex(idx, "Bandulan").length).toBeGreaterThan(0);
    expect(searchGlobalIndex(idx, "SDN").some((h) => h.kind === "school")).toBe(true);
    expect(searchGlobalIndex(idx, "Klinik").some((h) => h.kind === "amenity")).toBe(true);
  });

  it("calculates interactive distance and polygon area measurements", () => {
    const dist = computeMeasurement("distance", [
      [112.600, -7.983],
      [112.605, -7.983],
    ]);
    expect(dist.totalDistanceMeters).toBeGreaterThan(500);
    expect(dist.totalDistanceMeters).toBeLessThan(600);

    const poly = computeMeasurement("area", [
      [112.600, -7.982],
      [112.602, -7.982],
      [112.602, -7.984],
      [112.600, -7.984],
    ]);
    expect(poly.areaSqm).toBeGreaterThan(40000);
    expect(poly.areaSqm).toBeLessThan(55000);
  });
});

export type _CheckLayerId = LayerId;
