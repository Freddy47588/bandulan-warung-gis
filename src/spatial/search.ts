import centroid from "@turf/centroid";
import type { BandulanDatasets, EnrichedWarung, GlobalSearchHit } from "../types/geo";

export function buildGlobalSearchIndex(
  warungs: EnrichedWarung[],
  datasets: BandulanDatasets,
): GlobalSearchHit[] {
  const hits: GlobalSearchHit[] = [];

  for (const w of warungs) {
    hits.push({
      id: `warung-${w.id}`,
      kind: "warung",
      name: w.name,
      subtitle: w.address,
      coordinates: w.coordinates,
      zoom: 16.8,
      warungId: w.id,
    });
  }

  for (const ft of datasets.schools.features) {
    if (!ft.properties.Nama) continue;
    const c = centroid(ft).geometry.coordinates as [number, number];
    hits.push({
      id: `school-${ft.properties.id}`,
      kind: "school",
      name: ft.properties.Nama,
      subtitle: "School · Bandulan",
      coordinates: c,
      zoom: 17.2,
    });
  }

  for (const ft of datasets.factories.features) {
    if (!ft.properties.Nama) continue;
    const c = centroid(ft).geometry.coordinates as [number, number];
    hits.push({
      id: `factory-${ft.properties.id}`,
      kind: "factory",
      name: ft.properties.Nama,
      subtitle: "Factory · Bandulan",
      coordinates: c,
      zoom: 16.5,
    });
  }

  for (const ft of datasets.amenities.features) {
    if (!ft.properties.Nama) continue;
    hits.push({
      id: `amenity-${ft.properties.id}`,
      kind: "amenity",
      name: ft.properties.Nama,
      subtitle: `${ft.properties.amenityType} · OSM`,
      coordinates: ft.geometry.coordinates as [number, number],
      zoom: 17.2,
    });
  }

  for (const ft of datasets["green-spaces"].features) {
    if (!ft.properties.Nama) continue;
    const c = centroid(ft).geometry.coordinates as [number, number];
    hits.push({
      id: `green-${ft.properties.id}`,
      kind: "green",
      name: ft.properties.Nama,
      subtitle: "Green Space · Bandulan",
      coordinates: c,
      zoom: 16.5,
    });
  }

  // Deduplicated named roads across all 3 road tiers
  const seenRoads = new Set<string>();
  const roadLayers = [
    datasets["village-roads"],
    datasets["residential-roads"],
    datasets.alleys,
  ];
  for (const fc of roadLayers) {
    for (const ft of fc.features) {
      const name = ft.properties.Nama?.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seenRoads.has(key)) continue;
      seenRoads.add(key);
      const coords =
        ft.geometry.type === "LineString"
          ? ft.geometry.coordinates
          : ft.geometry.coordinates[0] ?? [];
      if (!coords.length) continue;
      const mid = coords[Math.floor(coords.length / 2)] as [number, number];
      hits.push({
        id: `road-${key}`,
        kind: "road",
        name,
        subtitle: "Road · Bandulan",
        coordinates: mid,
        zoom: 16.4,
      });
    }
  }

  return hits;
}

export function searchGlobalIndex(index: GlobalSearchHit[], rawQuery: string): GlobalSearchHit[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q),
    )
    .slice(0, 12);
}
