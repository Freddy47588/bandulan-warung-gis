import centroid from "@turf/centroid";
import distance from "@turf/distance";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import type {
  AmenityFeature,
  AreaFeature,
  BandulanDatasets,
  EnrichedWarung,
  LineFeature,
  SpatialRef,
  WarungFeature,
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

function nearestLineFeature(point: WarungFeature, lines: LineFeature[], fallbackName: string): SpatialRef {
  let bestDist = Infinity;
  let bestName = fallbackName;

  for (const line of lines) {
    const snapped = nearestPointOnLine(line, point, { units: "meters" });
    const dist = snapped.properties.dist ?? distance(point, snapped, { units: "meters" });
    if (dist < bestDist) {
      bestDist = dist;
      bestName = line.properties.Nama?.trim() || fallbackName;
    }
  }

  return {
    name: bestName,
    distanceMeters: Math.round(bestDist),
  };
}

function nearestAreaFeature(point: WarungFeature, areas: AreaFeature[], fallbackName: string): SpatialRef {
  let bestDist = Infinity;
  let bestName = fallbackName;

  for (const poly of areas) {
    const center = centroid(poly);
    const dist = distance(point, center, { units: "meters" });
    if (dist < bestDist) {
      bestDist = dist;
      bestName = poly.properties.Nama?.trim() || fallbackName;
    }
  }

  return {
    name: bestName,
    distanceMeters: Math.round(bestDist),
  };
}

function nearestPointFeature(point: WarungFeature, points: AmenityFeature[], fallbackName: string): SpatialRef {
  if (!points.length) return { name: fallbackName, distanceMeters: 0 };
  let bestDist = Infinity;
  let bestName = fallbackName;
  const ptCoord = point.geometry.coordinates as [number, number];

  for (const ft of points) {
    const d = fastMeters(ptCoord, ft.geometry.coordinates as [number, number]);
    if (d < bestDist) {
      bestDist = d;
      bestName = ft.properties.Nama?.trim() || fallbackName;
    }
  }

  return {
    name: bestName,
    distanceMeters: Math.round(bestDist),
  };
}

export function enrichWarungs(datasets: BandulanDatasets): EnrichedWarung[] {
  const warungFeatures = datasets.warungs.features;
  const primaryRoads = [
    ...datasets["village-roads"].features,
    ...datasets["residential-roads"].features.filter((r) => Boolean(r.properties.Nama)),
  ];

  // Precompute building centroids once for fast 250m density counting across thousands of OSM buildings
  const buildingCenters: [number, number][] = datasets.buildings.features.map(
    (b) => centroid(b).geometry.coordinates as [number, number],
  );

  return warungFeatures.map((feature) => {
    const id = String(feature.properties.id);
    const name = feature.properties.Lokasi;
    const address = feature.properties.Alamat;
    const source = feature.properties.source ?? "qgis";
    const category = feature.properties.category ?? "food";
    const coords = feature.geometry.coordinates as [number, number];

    const nearestRoad = nearestLineFeature(
      feature,
      primaryRoads.length ? primaryRoads : datasets["village-roads"].features,
      "Jalan Bandulan",
    );
    const nearestSchool = nearestAreaFeature(feature, datasets.schools.features, "Sekolah");
    const nearestFactory = nearestAreaFeature(feature, datasets.factories.features, "Pabrik");
    const nearestAmenity = nearestPointFeature(feature, datasets.amenities.features, "Fasilitas Publik");
    const nearestRiver = nearestLineFeature(feature, datasets.rivers.features, "Sungai");

    let bestWarungDist = Infinity;
    let bestWarungName = name;
    for (const other of warungFeatures) {
      if (String(other.properties.id) === id) continue;
      const d = fastMeters(coords, other.geometry.coordinates as [number, number]);
      if (d < bestWarungDist) {
        bestWarungDist = d;
        bestWarungName = other.properties.Lokasi;
      }
    }

    let buildingsWithin250m = 0;
    for (const bc of buildingCenters) {
      if (Math.abs(bc[0] - coords[0]) > 0.003 || Math.abs(bc[1] - coords[1]) > 0.003) continue;
      if (fastMeters(coords, bc) <= 250) buildingsWithin250m += 1;
    }

    return {
      id,
      name,
      address,
      source,
      category,
      coordinates: coords,
      feature,
      nearestRoad,
      nearestSchool,
      nearestFactory,
      nearestAmenity,
      nearestRiver,
      nearestWarung: {
        name: bestWarungName,
        distanceMeters: Math.round(bestWarungDist),
      },
      buildingsWithin250m,
    };
  });
}
