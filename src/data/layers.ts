import type { LayerGroupId, LayerId } from "../types/geo";

export interface LayerMeta {
  id: LayerId;
  file: string;
  group: LayerGroupId;
  symbol: "point" | "line" | "area";
  color: string;
  strokeColor?: string;
  defaultVisible: boolean;
  extrudable?: boolean;
}

export const LAYER_GROUPS: LayerGroupId[] = [
  "business",
  "administrative",
  "infrastructure",
  "urban",
  "facilities",
  "environment",
];

export const LAYER_CATALOG: LayerMeta[] = [
  {
    id: "warungs",
    file: "warungs.geojson",
    group: "business",
    symbol: "point",
    color: "#10b981",
    strokeColor: "#ffffff",
    defaultVisible: true,
  },
  {
    id: "boundary",
    file: "boundary.geojson",
    group: "administrative",
    symbol: "line",
    color: "#2dd4bf",
    defaultVisible: true,
  },
  {
    id: "village-roads",
    file: "village-roads.geojson",
    group: "infrastructure",
    symbol: "line",
    color: "#f59e0b",
    defaultVisible: true,
  },
  {
    id: "residential-roads",
    file: "residential-roads.geojson",
    group: "infrastructure",
    symbol: "line",
    color: "#fbbf24",
    defaultVisible: true,
  },
  {
    id: "alleys",
    file: "alleys.geojson",
    group: "infrastructure",
    symbol: "line",
    color: "#cbd5e1",
    defaultVisible: true,
  },
  {
    id: "buildings",
    file: "buildings.geojson",
    group: "urban",
    symbol: "area",
    color: "#94a3b8",
    strokeColor: "#e2e8f0",
    defaultVisible: true,
    extrudable: true,
  },
  {
    id: "residential-areas",
    file: "residential-areas.geojson",
    group: "urban",
    symbol: "area",
    color: "#fde68a",
    strokeColor: "#f59e0b",
    defaultVisible: false,
  },
  {
    id: "green-spaces",
    file: "green-spaces.geojson",
    group: "urban",
    symbol: "area",
    color: "#22c55e",
    strokeColor: "#86efac",
    defaultVisible: true,
  },
  {
    id: "schools",
    file: "schools.geojson",
    group: "facilities",
    symbol: "area",
    color: "#38bdf8",
    strokeColor: "#bae6fd",
    defaultVisible: true,
    extrudable: true,
  },
  {
    id: "factories",
    file: "factories.geojson",
    group: "facilities",
    symbol: "area",
    color: "#a78bfa",
    strokeColor: "#ddd6fe",
    defaultVisible: true,
    extrudable: true,
  },
  {
    id: "amenities",
    file: "amenities.geojson",
    group: "facilities",
    symbol: "point",
    color: "#f472b6",
    strokeColor: "#ffffff",
    defaultVisible: true,
  },
  {
    id: "rivers",
    file: "rivers.geojson",
    group: "environment",
    symbol: "line",
    color: "#06b6d4",
    defaultVisible: true,
  },
];

export const DEFAULT_VISIBLE_LAYERS: Record<LayerId, boolean> = Object.fromEntries(
  LAYER_CATALOG.map((layer) => [layer.id, layer.defaultVisible]),
) as Record<LayerId, boolean>;

export const BANDULAN_CENTER: [number, number] = [112.6022, -7.9838];
export const BANDULAN_BOUNDS: [[number, number], [number, number]] = [
  [112.5885, -7.9972],
  [112.6145, -7.9722],
];
