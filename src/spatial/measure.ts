import area from "@turf/area";
import { featureCollection, lineString, point, polygon } from "@turf/helpers";
import length from "@turf/length";
import type { Feature, Geometry } from "geojson";
import type { MeasureMode, MeasureResult } from "../types/geo";

export function computeMeasurement(
  mode: MeasureMode,
  points: [number, number][],
): MeasureResult {
  const features: Feature<Geometry>[] = points.map((coord, idx) =>
    point(coord, { index: idx + 1, kind: "vertex" }),
  );

  let totalDistanceMeters = 0;
  let areaSqm = 0;
  let perimeterMeters = 0;

  if (mode === "distance" && points.length >= 2) {
    const line = lineString(points, { kind: "measure-line" });
    totalDistanceMeters = Math.round(length(line, { units: "meters" }));
    features.push(line);
  }

  if (mode === "area") {
    if (points.length === 2) {
      const line = lineString(points, { kind: "measure-line" });
      perimeterMeters = Math.round(length(line, { units: "meters" }));
      features.push(line);
    } else if (points.length >= 3) {
      const closedRing = [...points, points[0]];
      const poly = polygon([closedRing], { kind: "measure-polygon" });
      const outline = lineString(closedRing, { kind: "measure-line" });
      areaSqm = Math.round(area(poly));
      perimeterMeters = Math.round(length(outline, { units: "meters" }));
      features.push(poly, outline);
    }
  }

  return {
    mode,
    points,
    totalDistanceMeters,
    areaSqm,
    perimeterMeters,
    geometry: featureCollection(features),
  };
}
