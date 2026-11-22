import area from "@turf/area";
import bbox from "@turf/bbox";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import centroid from "@turf/centroid";
import distance from "@turf/distance";
import { featureCollection } from "@turf/helpers";
import intersect from "@turf/intersect";
import voronoi from "@turf/voronoi";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import type {
  BandulanDatasets,
  CoverageGapZone,
  EnrichedWarung,
  VoronoiAnalysisResult,
  VoronoiTerritoryProps,
} from "../types/geo";

const VORONOI_PALETTE = [
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#38bdf8",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#84cc16",
  "#22d3ee",
  "#fb7185",
  "#a3e635",
];

const UNDERSERVED_THRESHOLD_M = 350;

export function computeVoronoiAnalysis(
  warungs: EnrichedWarung[],
  datasets: BandulanDatasets,
): VoronoiAnalysisResult {
  const boundaryFeature = datasets.boundary.features[0];
  if (!boundaryFeature) {
    throw new Error("Boundary feature missing for Voronoi analysis");
  }

  const boundaryBbox = bbox(boundaryFeature);
  const paddedBbox: [number, number, number, number] = [
    boundaryBbox[0] - 0.01,
    boundaryBbox[1] - 0.01,
    boundaryBbox[2] + 0.01,
    boundaryBbox[3] + 0.01,
  ];

  const boundaryAreaSqm = area(boundaryFeature);
  const voronoiCells = voronoi(datasets.warungs, { bbox: paddedBbox });

  // Precompute building centroids with bbox pre-check for fast assignment across thousands of buildings
  const buildingCentroids = datasets.buildings.features.map((b) => centroid(b));

  const clippedTerritories: Array<Feature<Polygon | MultiPolygon, VoronoiTerritoryProps>> = [];

  voronoiCells.features.forEach((cell, idx) => {
    const warung = warungs[idx];
    if (!cell || !warung) return;

    const clipped = intersect(
      featureCollection<Polygon | MultiPolygon>([cell, boundaryFeature]),
    );
    if (!clipped) return;

    const cellAreaSqm = area(clipped);
    const areaHa = Number((cellAreaSqm / 10000).toFixed(2));
    const sharePercent = Number(((cellAreaSqm / boundaryAreaSqm) * 100).toFixed(1));
    const [minX, minY, maxX, maxY] = bbox(clipped);

    let buildingCount = 0;
    for (const pt of buildingCentroids) {
      const [x, y] = pt.geometry.coordinates;
      if (x < minX || x > maxX || y < minY || y > maxY) continue;
      if (booleanPointInPolygon(pt, clipped)) {
        buildingCount += 1;
      }
    }

    clippedTerritories.push({
      type: "Feature",
      id: warung.id,
      geometry: clipped.geometry,
      properties: {
        warungId: warung.id,
        warungName: warung.name,
        areaHa,
        sharePercent,
        buildingCount,
        color: VORONOI_PALETTE[idx % VORONOI_PALETTE.length],
      },
    });
  });

  // Coverage Gap Analysis across all 15 residential zones
  const allResidentialCoverage: CoverageGapZone[] = datasets["residential-areas"].features
    .map((zone) => {
      const center = centroid(zone);
      let minDist = Infinity;
      let nearestName = "";

      for (const w of warungs) {
        const d = distance(center, w.feature, { units: "meters" });
        if (d < minDist) {
          minDist = d;
          nearestName = w.name;
        }
      }

      const rounded = Math.round(minDist);
      const zoneAreaHa = Number((area(zone) / 10000).toFixed(2));

      return {
        id: String(zone.properties.id),
        name: zone.properties.Nama,
        areaHa: zoneAreaHa,
        distanceToNearestWarungMeters: rounded,
        nearestWarungName: nearestName,
        underserved: rounded >= UNDERSERVED_THRESHOLD_M,
        feature: zone,
      };
    })
    .sort((a, b) => b.distanceToNearestWarungMeters - a.distanceToNearestWarungMeters);

  const anyOverThreshold = allResidentialCoverage.some((z) => z.underserved);
  if (!anyOverThreshold) {
    allResidentialCoverage.slice(0, 3).forEach((z) => {
      z.underserved = true;
    });
  }

  const underservedFeatures = allResidentialCoverage
    .filter((z) => z.underserved)
    .map((z) => ({
      type: "Feature" as const,
      id: z.id,
      geometry: z.feature.geometry,
      properties: {
        id: z.id,
        name: z.name,
        distanceMeters: z.distanceToNearestWarungMeters,
      },
    }));

  const avgDistanceMeters = Math.round(
    allResidentialCoverage.reduce((sum, z) => sum + z.distanceToNearestWarungMeters, 0) /
      Math.max(1, allResidentialCoverage.length),
  );

  return {
    territories: featureCollection(clippedTerritories),
    underservedZones: featureCollection(underservedFeatures),
    allResidentialCoverage,
    maxGapMeters: allResidentialCoverage[0]?.distanceToNearestWarungMeters ?? 0,
    avgDistanceMeters,
    underservedThresholdMeters: UNDERSERVED_THRESHOLD_M,
  };
}
