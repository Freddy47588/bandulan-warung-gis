import distance from "@turf/distance";
import { lineString, point } from "@turf/helpers";
import type { EnrichedWarung, NearestResult, NearestWarungRanking, RouteMode } from "../types/geo";
import { computeRoadRoutesFromOrigin, type RoadGraph } from "./routing";

// Average urban walking speed: 4.5 km/h = 75 meters / minute.
const WALKING_METERS_PER_MIN = 75;

export function findNearestWarung(
  origin: [number, number],
  warungs: EnrichedWarung[],
  source: "click" | "gps" = "click",
  routeMode: RouteMode = "road",
  roadGraph?: RoadGraph | null,
): NearestResult {
  if (!warungs.length) {
    throw new Error("No warungs available for nearest search");
  }

  const originPt = point(origin);
  const roadRoutes =
    routeMode === "road" && roadGraph
      ? computeRoadRoutesFromOrigin(origin, warungs, roadGraph)
      : null;

  const ranked: NearestWarungRanking[] = warungs
    .map((w) => {
      const roadRoute = roadRoutes?.get(w.id);
      if (roadRoute) {
        return {
          id: w.id,
          name: w.name,
          address: w.address,
          distanceMeters: roadRoute.distanceMeters,
          walkMinutes: roadRoute.walkMinutes,
          coordinates: w.coordinates,
          viaRoad: true,
        };
      }
      const distMeters = Math.round(distance(originPt, w.feature, { units: "meters" }));
      const walkMinutes = Math.max(1, Math.round(distMeters / WALKING_METERS_PER_MIN));
      return {
        id: w.id,
        name: w.name,
        address: w.address,
        distanceMeters: distMeters,
        walkMinutes,
        coordinates: w.coordinates,
        viaRoad: false,
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  const nearest = ranked[0];
  const matchedRoadRoute = roadRoutes?.get(nearest.id);

  return {
    origin,
    source,
    routeMode,
    viaRoad: Boolean(matchedRoadRoute),
    nearest,
    topThree: ranked.slice(0, 3),
    line:
      matchedRoadRoute?.path ??
      lineString([origin, nearest.coordinates], {
        distanceMeters: nearest.distanceMeters,
        warungName: nearest.name,
        viaRoad: false,
      }),
    originPoint: point(origin, { source }),
  };
}
