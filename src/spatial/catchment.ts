import booleanIntersects from "@turf/boolean-intersects";
import buffer from "@turf/buffer";
import centroid from "@turf/centroid";
import type {
  BandulanDatasets,
  CatchmentRadius,
  CatchmentResult,
  EnrichedWarung,
} from "../types/geo";

const DEG2RAD = Math.PI / 180;
function fastMeters(a: [number, number], b: [number, number]): number {
  const dLat = (b[1] - a[1]) * DEG2RAD;
  const dLon = (b[0] - a[0]) * DEG2RAD;
  const lat1 = a[1] * DEG2RAD;
  const lat2 = b[1] * DEG2RAD;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function computeCatchment(
  warung: EnrichedWarung,
  radiusMeters: CatchmentRadius,
  datasets: BandulanDatasets,
): CatchmentResult {
  const buffered = buffer(warung.feature, radiusMeters / 1000, {
    units: "kilometers",
    steps: 64,
  });

  if (!buffered) {
    throw new Error(`Unable to compute ${radiusMeters}m buffer for ${warung.name}`);
  }

  const origin = warung.coordinates;
  const degPad = (radiusMeters / 111000) * 1.35;

  let buildings = 0;
  const matchedBuildingIds: string[] = [];
  for (const ft of datasets.buildings.features) {
    const c = centroid(ft).geometry.coordinates as [number, number];
    if (Math.abs(c[0] - origin[0]) > degPad || Math.abs(c[1] - origin[1]) > degPad) continue;
    if (fastMeters(origin, c) <= radiusMeters) {
      buildings += 1;
      matchedBuildingIds.push(String(ft.properties.FID));
    }
  }

  const schoolNames: string[] = [];
  for (const ft of datasets.schools.features) {
    if (booleanIntersects(buffered, ft)) {
      schoolNames.push(ft.properties.Nama);
    }
  }

  const factoryNames: string[] = [];
  for (const ft of datasets.factories.features) {
    if (booleanIntersects(buffered, ft)) {
      factoryNames.push(ft.properties.Nama);
    }
  }

  const amenityNames: string[] = [];
  for (const ft of datasets.amenities.features) {
    const c = ft.geometry.coordinates as [number, number];
    if (fastMeters(origin, c) <= radiusMeters) {
      amenityNames.push(ft.properties.Nama);
    }
  }

  let residentialAreas = 0;
  for (const ft of datasets["residential-areas"].features) {
    if (booleanIntersects(buffered, ft)) residentialAreas += 1;
  }

  let greenSpaces = 0;
  for (const ft of datasets["green-spaces"].features) {
    if (booleanIntersects(buffered, ft)) greenSpaces += 1;
  }

  const otherWarungNames: string[] = [];
  for (const ft of datasets.warungs.features) {
    if (String(ft.properties.id) === warung.id) continue;
    const c = ft.geometry.coordinates as [number, number];
    if (fastMeters(origin, c) <= radiusMeters) {
      otherWarungNames.push(ft.properties.Lokasi);
    }
  }

  return {
    warungId: warung.id,
    warungName: warung.name,
    radiusMeters,
    buffer: buffered,
    counts: {
      buildings,
      schools: schoolNames.length,
      factories: factoryNames.length,
      amenities: amenityNames.length,
      residentialAreas,
      greenSpaces,
      otherWarungs: otherWarungNames.length,
    },
    schoolNames,
    factoryNames,
    amenityNames,
    otherWarungNames,
    matchedBuildingIds,
  };
}
