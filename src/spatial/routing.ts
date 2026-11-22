import { lineString } from "@turf/helpers";
import type { Feature, LineString } from "geojson";
import type { BandulanDatasets, EnrichedWarung } from "../types/geo";

interface Edge {
  to: number;
  weight: number;
}

export interface RoadGraph {
  coords: [number, number][];
  adj: Edge[][];
}

export interface RoadRouteResult {
  warungId: string;
  distanceMeters: number;
  walkMinutes: number;
  path: Feature<LineString>;
  viaRoad: boolean;
}

const WALKING_METERS_PER_MIN = 75;
const DEG2RAD = Math.PI / 180;

function haversineMeters(a: [number, number], b: [number, number]): number {
  const dLat = (b[1] - a[1]) * DEG2RAD;
  const dLon = (b[0] - a[0]) * DEG2RAD;
  const lat1 = a[1] * DEG2RAD;
  const lat2 = b[1] * DEG2RAD;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function nodeKey(coord: [number, number]): string {
  return `${coord[0].toFixed(5)},${coord[1].toFixed(5)}`;
}

export function buildRoadGraph(datasets: BandulanDatasets): RoadGraph {
  const keyToId = new Map<string, number>();
  const coords: [number, number][] = [];
  const adj: Edge[][] = [];

  const getOrCreateNode = (coord: [number, number]): number => {
    const key = nodeKey(coord);
    const existing = keyToId.get(key);
    if (existing !== undefined) return existing;
    const id = coords.length;
    keyToId.set(key, id);
    coords.push(coord);
    adj.push([]);
    return id;
  };

  const addLineCoords = (ring: number[][]) => {
    for (let i = 0; i < ring.length - 1; i += 1) {
      const a: [number, number] = [ring[i][0], ring[i][1]];
      const b: [number, number] = [ring[i + 1][0], ring[i + 1][1]];
      const u = getOrCreateNode(a);
      const v = getOrCreateNode(b);
      if (u === v) continue;
      const w = haversineMeters(a, b);
      adj[u].push({ to: v, weight: w });
      adj[v].push({ to: u, weight: w });
    }
  };

  const roadLayers = [
    datasets["village-roads"],
    datasets["residential-roads"],
    datasets.alleys,
  ];

  for (const fc of roadLayers) {
    for (const ft of fc.features) {
      if (ft.geometry.type === "LineString") {
        addLineCoords(ft.geometry.coordinates);
      } else if (ft.geometry.type === "MultiLineString") {
        for (const line of ft.geometry.coordinates) {
          addLineCoords(line);
        }
      }
    }
  }

  return { coords, adj };
}

function findClosestNode(graph: RoadGraph, target: [number, number]): { id: number; dist: number } {
  let bestId = -1;
  let bestDist = Infinity;
  for (let i = 0; i < graph.coords.length; i += 1) {
    const d = haversineMeters(graph.coords[i], target);
    if (d < bestDist) {
      bestDist = d;
      bestId = i;
    }
  }
  return { id: bestId, dist: bestDist };
}

// Lightweight binary min-heap for fast client-side Dijkstra
class MinHeap {
  private items: Array<{ node: number; dist: number }> = [];

  get size() {
    return this.items.length;
  }

  push(item: { node: number; dist: number }) {
    this.items.push(item);
    let idx = this.items.length - 1;
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.items[parent].dist <= this.items[idx].dist) break;
      [this.items[parent], this.items[idx]] = [this.items[idx], this.items[parent]];
      idx = parent;
    }
  }

  pop(): { node: number; dist: number } | undefined {
    if (!this.items.length) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length) {
      this.items[0] = last;
      let idx = 0;
      const n = this.items.length;
      while (true) {
        const left = idx * 2 + 1;
        const right = idx * 2 + 2;
        let smallest = idx;
        if (left < n && this.items[left].dist < this.items[smallest].dist) smallest = left;
        if (right < n && this.items[right].dist < this.items[smallest].dist) smallest = right;
        if (smallest === idx) break;
        [this.items[idx], this.items[smallest]] = [this.items[smallest], this.items[idx]];
        idx = smallest;
      }
    }
    return top;
  }
}

export function computeRoadRoutesFromOrigin(
  origin: [number, number],
  warungs: EnrichedWarung[],
  graph: RoadGraph,
): Map<string, RoadRouteResult> {
  const results = new Map<string, RoadRouteResult>();
  if (graph.coords.length === 0) return results;

  const startSnap = findClosestNode(graph, origin);
  // If origin is far outside the mapped Bandulan road network (> 600m), skip road routing
  if (startSnap.id === -1 || startSnap.dist > 600) return results;

  const n = graph.coords.length;
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  dist[startSnap.id] = 0;

  const heap = new MinHeap();
  heap.push({ node: startSnap.id, dist: 0 });

  while (heap.size > 0) {
    const cur = heap.pop()!;
    if (cur.dist > dist[cur.node]) continue;
    for (const edge of graph.adj[cur.node]) {
      const nd = cur.dist + edge.weight;
      if (nd < dist[edge.to]) {
        dist[edge.to] = nd;
        prev[edge.to] = cur.node;
        heap.push({ node: edge.to, dist: nd });
      }
    }
  }

  for (const w of warungs) {
    const endSnap = findClosestNode(graph, w.coordinates);
    if (endSnap.id === -1 || !Number.isFinite(dist[endSnap.id])) continue;

    // Reconstruct path
    const pathCoords: [number, number][] = [];
    let cur = endSnap.id;
    while (cur !== -1) {
      pathCoords.push(graph.coords[cur]);
      cur = prev[cur];
    }
    pathCoords.reverse();

    const fullCoords: [number, number][] = [origin, ...pathCoords, w.coordinates];
    const totalMeters = Math.round(startSnap.dist + dist[endSnap.id] + endSnap.dist);

    results.set(w.id, {
      warungId: w.id,
      distanceMeters: totalMeters,
      walkMinutes: Math.max(1, Math.round(totalMeters / WALKING_METERS_PER_MIN)),
      path: lineString(fullCoords, {
        distanceMeters: totalMeters,
        warungName: w.name,
        viaRoad: true,
      }),
      viaRoad: true,
    });
  }

  return results;
}
