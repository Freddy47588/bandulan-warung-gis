import area from "@turf/area";
import distance from "@turf/distance";
import length from "@turf/length";
import type { AmenityType, BandulanDatasets, SpatialInsights } from "../types/geo";

function sumLengthKm(fc: BandulanDatasets["village-roads"]): number {
  return fc.features.reduce((acc, ft) => acc + length(ft, { units: "kilometers" }), 0);
}

function sumAreaHa(fc: BandulanDatasets["schools"] | BandulanDatasets["buildings"]): number {
  return fc.features.reduce((acc, ft) => acc + area(ft) / 10000, 0);
}

const AMENITY_COLORS: Record<AmenityType, string> = {
  worship: "#f472b6",
  health: "#fb7185",
  civic: "#38bdf8",
  education: "#60a5fa",
};

export function computeSpatialInsights(datasets: BandulanDatasets): SpatialInsights {
  const boundaryAreaHa = Number(
    (datasets.boundary.features.reduce((acc, ft) => acc + area(ft), 0) / 10000).toFixed(2),
  );
  const boundaryAreaKm2 = boundaryAreaHa / 100;
  const warungCount = datasets.warungs.features.length;
  const qgisWarungCount = datasets.warungs.features.filter(
    (f) => (f.properties.source ?? "qgis") === "qgis",
  ).length;
  const osmWarungCount = warungCount - qgisWarungCount;
  const warungDensityPerKm2 = Number((warungCount / Math.max(0.01, boundaryAreaKm2)).toFixed(2));

  const roadLayers: Array<{
    layerId: "village-roads" | "residential-roads" | "alleys";
    color: string;
  }> = [
    { layerId: "village-roads", color: "#f59e0b" },
    { layerId: "residential-roads", color: "#fbbf24" },
    { layerId: "alleys", color: "#cbd5e1" },
  ];

  const roadBreakdown = roadLayers.map(({ layerId, color }) => {
    const fc = datasets[layerId];
    return {
      layerId,
      lengthKm: Number(sumLengthKm(fc).toFixed(2)),
      featureCount: fc.features.length,
      color,
    };
  });

  const totalRoadKm = Number(
    roadBreakdown.reduce((acc, item) => acc + item.lengthKm, 0).toFixed(2),
  );

  const landUseLayers: Array<{
    layerId: "residential-areas" | "factories" | "green-spaces" | "schools" | "buildings";
    color: string;
  }> = [
    { layerId: "residential-areas", color: "#fde68a" },
    { layerId: "green-spaces", color: "#22c55e" },
    { layerId: "factories", color: "#a78bfa" },
    { layerId: "buildings", color: "#94a3b8" },
    { layerId: "schools", color: "#38bdf8" },
  ];

  const landUseBreakdown = landUseLayers
    .map(({ layerId, color }) => {
      const fc = datasets[layerId];
      const areaHa = Number(sumAreaHa(fc).toFixed(2));
      return {
        layerId,
        areaHa,
        shareOfBoundaryPct: Number(((areaHa / Math.max(0.01, boundaryAreaHa)) * 100).toFixed(1)),
        featureCount: fc.features.length,
        color,
      };
    })
    .sort((a, b) => b.areaHa - a.areaHa);

  const amenityCount = datasets.amenities.features.length;
  const amMap = new Map<AmenityType, number>();
  for (const ft of datasets.amenities.features) {
    const t = ft.properties.amenityType;
    amMap.set(t, (amMap.get(t) ?? 0) + 1);
  }
  const amenityBreakdown = (["worship", "health", "civic", "education"] as AmenityType[])
    .map((type) => ({
      type,
      count: amMap.get(type) ?? 0,
      color: AMENITY_COLORS[type],
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const riverLengthKm = Number(sumLengthKm(datasets.rivers).toFixed(2));

  const nnDistances: number[] = datasets.warungs.features.map((w1) => {
    let minD = Infinity;
    for (const w2 of datasets.warungs.features) {
      if (w1.properties.id === w2.properties.id) continue;
      const d = distance(w1, w2, { units: "meters" });
      if (d < minD) minD = d;
    }
    return minD;
  });

  const nearestNeighborAvgM = Math.round(
    nnDistances.reduce((a, b) => a + b, 0) / Math.max(1, nnDistances.length),
  );
  const nearestNeighborMinM = Math.round(Math.min(...nnDistances));
  const nearestNeighborMaxM = Math.round(Math.max(...nnDistances));

  return {
    boundaryAreaHa,
    warungCount,
    qgisWarungCount,
    osmWarungCount,
    warungDensityPerKm2,
    totalRoadKm,
    roadBreakdown,
    landUseBreakdown,
    amenityCount,
    amenityBreakdown,
    riverLengthKm,
    nearestNeighborAvgM,
    nearestNeighborMinM,
    nearestNeighborMaxM,
  };
}
