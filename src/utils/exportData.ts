import type { CatchmentResult, EnrichedWarung, SpatialInsights } from "../types/geo";

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(value: string | number): string {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function exportCatchmentCsv(result: CatchmentResult) {
  const rows = [
    ["Metric", "Value"],
    ["Warung Name", result.warungName],
    ["Radius (m)", result.radiusMeters],
    ["Buildings", result.counts.buildings],
    ["Schools", result.counts.schools],
    ["Factories", result.counts.factories],
    ["Public Amenities", result.counts.amenities],
    ["Residential Zones", result.counts.residentialAreas],
    ["Green Spaces", result.counts.greenSpaces],
    ["Other Warungs", result.counts.otherWarungs],
  ];
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const slug = result.warungName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  triggerDownload(`bandulan-catchment-${slug}-${result.radiusMeters}m.csv`, csv, "text/csv;charset=utf-8");
}

export function exportCatchmentGeoJson(result: CatchmentResult) {
  const fc = {
    type: "FeatureCollection",
    features: [
      {
        ...result.buffer,
        properties: {
          warungId: result.warungId,
          warungName: result.warungName,
          radiusMeters: result.radiusMeters,
          ...result.counts,
        },
      },
    ],
  };
  const slug = result.warungName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  triggerDownload(
    `bandulan-catchment-${slug}-${result.radiusMeters}m.geojson`,
    JSON.stringify(fc, null, 2),
    "application/geo+json;charset=utf-8",
  );
}

export function exportInsightsCsv(insights: SpatialInsights, warungs: EnrichedWarung[]) {
  const lines: string[][] = [
    ["Section", "Metric", "Value", "Unit"],
    ["Summary", "Study Area", insights.boundaryAreaHa.toString(), "ha"],
    ["Summary", "Mapped Warungs", insights.warungCount.toString(), "count"],
    ["Summary", "Warung Density", insights.warungDensityPerKm2.toString(), "per km2"],
    ["Summary", "Total Road Network", insights.totalRoadKm.toString(), "km"],
    ["Summary", "River Corridors", insights.riverLengthKm.toString(), "km"],
    ["Summary", "Supporting Amenities", insights.amenityCount.toString(), "count"],
    ["Summary", "Avg Warung Spacing", insights.nearestNeighborAvgM.toString(), "m"],
    [],
    ["Road Breakdown", "Layer", "Length (km)", "Segments"],
    ...insights.roadBreakdown.map((r) => ["Road", r.layerId, r.lengthKm.toString(), r.featureCount.toString()]),
    [],
    ["Land Use", "Layer", "Area (ha)", "Share (%)"],
    ...insights.landUseBreakdown.map((l) => [
      "LandUse",
      l.layerId,
      l.areaHa.toString(),
      l.shareOfBoundaryPct.toString(),
    ]),
    [],
    ["Warung Directory", "Name", "Category", "Source", "Nearest Road (m)", "Buildings 250m", "Lng", "Lat"],
    ...warungs.map((w) => [
      w.id,
      w.name,
      w.category,
      w.source,
      w.nearestRoad.distanceMeters.toString(),
      w.buildingsWithin250m.toString(),
      w.coordinates[0].toFixed(6),
      w.coordinates[1].toFixed(6),
    ]),
  ];

  const csv = lines.map((r) => r.map(csvEscape).join(",")).join("\n");
  triggerDownload("bandulan-spatial-insights.csv", csv, "text/csv;charset=utf-8");
}
