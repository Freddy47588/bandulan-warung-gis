import type { LayerSpecification } from "maplibre-gl";
import type { LayerId } from "../types/geo";

export interface LayerMapping {
  layerId: LayerId;
  flatLayers: string[];
  extrusionLayers?: string[];
}

export const VECTOR_LAYER_MAPPINGS: LayerMapping[] = [
  {
    layerId: "residential-areas",
    flatLayers: ["residential-areas-fill", "residential-areas-outline"],
  },
  {
    layerId: "green-spaces",
    flatLayers: ["green-spaces-fill", "green-spaces-outline"],
  },
  {
    layerId: "buildings",
    flatLayers: ["buildings-fill", "buildings-outline"],
    extrusionLayers: ["buildings-3d"],
  },
  {
    layerId: "schools",
    flatLayers: ["schools-fill", "schools-outline"],
    extrusionLayers: ["schools-3d"],
  },
  {
    layerId: "factories",
    flatLayers: ["factories-fill", "factories-outline"],
    extrusionLayers: ["factories-3d"],
  },
  {
    layerId: "rivers",
    flatLayers: ["rivers-glow", "rivers-line"],
  },
  {
    layerId: "alleys",
    flatLayers: ["alleys-line"],
  },
  {
    layerId: "residential-roads",
    flatLayers: ["residential-roads-line", "residential-roads-labels"],
  },
  {
    layerId: "village-roads",
    flatLayers: ["village-roads-casing", "village-roads-line", "village-roads-labels"],
  },
  {
    layerId: "boundary",
    flatLayers: ["boundary-glow", "boundary-line"],
  },
  {
    layerId: "amenities",
    flatLayers: ["amenities-dot"],
  },
  {
    layerId: "warungs",
    flatLayers: ["warungs-halo"],
  },
];

export const INTERACTIVE_INSPECT_LAYERS = [
  "amenities-dot",
  "voronoi-fill",
  "schools-fill",
  "schools-3d",
  "factories-fill",
  "factories-3d",
  "green-spaces-fill",
  "residential-areas-fill",
  "village-roads-line",
  "residential-roads-line",
  "alleys-line",
  "rivers-line",
  "buildings-fill",
  "buildings-3d",
];

export function buildVectorLayerSpecs(): LayerSpecification[] {
  return [
    // Inverted Spotlight Mask: dims everything outside Kelurahan Bandulan boundary
    {
      id: "spotlight-mask",
      type: "fill",
      source: "overlay-spotlight",
      paint: {
        "fill-color": "#070c14",
        "fill-opacity": 0.56,
      },
    },

    // Residential zones
    {
      id: "residential-areas-fill",
      type: "fill",
      source: "src-residential-areas",
      paint: {
        "fill-color": "#fde68a",
        "fill-opacity": 0.2,
      },
    },
    {
      id: "residential-areas-outline",
      type: "line",
      source: "src-residential-areas",
      paint: {
        "line-color": "#f59e0b",
        "line-width": 1.25,
        "line-opacity": 0.65,
      },
    },

    // Green spaces
    {
      id: "green-spaces-fill",
      type: "fill",
      source: "src-green-spaces",
      paint: {
        "fill-color": "#22c55e",
        "fill-opacity": 0.28,
      },
    },
    {
      id: "green-spaces-outline",
      type: "line",
      source: "src-green-spaces",
      paint: {
        "line-color": "#86efac",
        "line-width": 1.4,
        "line-opacity": 0.85,
      },
    },

    // Voronoi overlay
    {
      id: "voronoi-fill",
      type: "fill",
      source: "overlay-voronoi",
      paint: {
        "fill-color": ["get", "color"],
        "fill-opacity": 0.22,
      },
    },
    {
      id: "voronoi-outline",
      type: "line",
      source: "overlay-voronoi",
      paint: {
        "line-color": "#e2e8f0",
        "line-width": 1.3,
        "line-dasharray": [3, 2],
        "line-opacity": 0.8,
      },
    },
    {
      id: "voronoi-gaps-fill",
      type: "fill",
      source: "overlay-gaps",
      paint: {
        "fill-color": "#f43f5e",
        "fill-opacity": 0.34,
      },
    },
    {
      id: "voronoi-gaps-outline",
      type: "line",
      source: "overlay-gaps",
      paint: {
        "line-color": "#fda4af",
        "line-width": 2.2,
      },
    },

    // Clean OSM Buildings (2D flat + 3D extrusion)
    {
      id: "buildings-fill",
      type: "fill",
      source: "src-buildings",
      paint: {
        "fill-color": "#cbd5e1",
        "fill-opacity": 0.28,
      },
    },
    {
      id: "buildings-outline",
      type: "line",
      source: "src-buildings",
      minzoom: 14,
      paint: {
        "line-color": "#e2e8f0",
        "line-width": 0.6,
        "line-opacity": 0.45,
      },
    },
    {
      id: "buildings-3d",
      type: "fill-extrusion",
      source: "src-buildings",
      layout: { visibility: "none" },
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["get", "height"],
          4.5,
          "#94a3b8",
          8.5,
          "#cbd5e1",
        ],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.82,
        "fill-extrusion-vertical-gradient": true,
      },
    },

    // Schools (2D + 3D)
    {
      id: "schools-fill",
      type: "fill",
      source: "src-schools",
      paint: {
        "fill-color": "#38bdf8",
        "fill-opacity": 0.45,
      },
    },
    {
      id: "schools-outline",
      type: "line",
      source: "src-schools",
      paint: {
        "line-color": "#e0f2fe",
        "line-width": 1.6,
      },
    },
    {
      id: "schools-3d",
      type: "fill-extrusion",
      source: "src-schools",
      layout: { visibility: "none" },
      paint: {
        "fill-extrusion-color": "#38bdf8",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.9,
        "fill-extrusion-vertical-gradient": true,
      },
    },

    // Factories (2D + 3D)
    {
      id: "factories-fill",
      type: "fill",
      source: "src-factories",
      paint: {
        "fill-color": "#a78bfa",
        "fill-opacity": 0.42,
      },
    },
    {
      id: "factories-outline",
      type: "line",
      source: "src-factories",
      paint: {
        "line-color": "#ede9fe",
        "line-width": 1.6,
      },
    },
    {
      id: "factories-3d",
      type: "fill-extrusion",
      source: "src-factories",
      layout: { visibility: "none" },
      paint: {
        "fill-extrusion-color": "#a78bfa",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.9,
        "fill-extrusion-vertical-gradient": true,
      },
    },

    // Rivers
    {
      id: "rivers-glow",
      type: "line",
      source: "src-rivers",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#06b6d4",
        "line-width": 6,
        "line-opacity": 0.25,
      },
    },
    {
      id: "rivers-line",
      type: "line",
      source: "src-rivers",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#22d3ee",
        "line-width": 2.4,
      },
    },

    // Full Bandulan Road Network (OSM connected graph)
    {
      id: "alleys-line",
      type: "line",
      source: "src-alleys",
      minzoom: 13.5,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#cbd5e1",
        "line-width": ["interpolate", ["linear"], ["zoom"], 13.5, 0.7, 17, 1.8],
        "line-opacity": 0.55,
      },
    },
    {
      id: "residential-roads-line",
      type: "line",
      source: "src-residential-roads",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#fbbf24",
        "line-width": ["interpolate", ["linear"], ["zoom"], 13, 1.1, 17, 2.8],
        "line-opacity": 0.78,
      },
    },
    {
      id: "village-roads-casing",
      type: "line",
      source: "src-village-roads",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#0f172a",
        "line-width": ["interpolate", ["linear"], ["zoom"], 13, 4.2, 17, 7.2],
        "line-opacity": 0.65,
      },
    },
    {
      id: "village-roads-line",
      type: "line",
      source: "src-village-roads",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#f59e0b",
        "line-width": ["interpolate", ["linear"], ["zoom"], 13, 2.5, 17, 4.6],
      },
    },

    // Street Name Labels
    {
      id: "residential-roads-labels",
      type: "symbol",
      source: "src-residential-roads",
      minzoom: 15.6,
      filter: ["has", "Nama"],
      layout: {
        "symbol-placement": "line",
        "text-field": ["get", "Nama"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 10.5,
        "text-max-angle": 35,
      },
      paint: {
        "text-color": "#fef3c7",
        "text-halo-color": "rgba(7, 12, 20, 0.9)",
        "text-halo-width": 1.6,
      },
    },
    {
      id: "village-roads-labels",
      type: "symbol",
      source: "src-village-roads",
      minzoom: 13.8,
      filter: ["has", "Nama"],
      layout: {
        "symbol-placement": "line",
        "text-field": ["get", "Nama"],
        "text-font": ["Noto Sans Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 14, 11, 17, 13],
        "text-max-angle": 35,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "rgba(7, 12, 20, 0.92)",
        "text-halo-width": 2,
      },
    },

    // Administrative boundary
    {
      id: "boundary-glow",
      type: "line",
      source: "src-boundary",
      paint: {
        "line-color": "#2dd4bf",
        "line-width": 7,
        "line-opacity": 0.2,
      },
    },
    {
      id: "boundary-line",
      type: "line",
      source: "src-boundary",
      paint: {
        "line-color": "#5eead4",
        "line-width": 2.4,
        "line-dasharray": [4, 2.5],
      },
    },

    // Supporting Public Facilities (progressive reveal from zoom >= 14.5)
    {
      id: "amenities-dot",
      type: "circle",
      source: "src-amenities",
      minzoom: 14.5,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 14.5, 3.5, 17, 6.5],
        "circle-color": [
          "match",
          ["get", "amenityType"],
          "worship",
          "#f472b6",
          "health",
          "#fb7185",
          "civic",
          "#38bdf8",
          "education",
          "#60a5fa",
          "#f472b6",
        ],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#070c14",
        "circle-opacity": ["interpolate", ["linear"], ["zoom"], 14.5, 0, 15.1, 0.92],
        "circle-stroke-opacity": ["interpolate", ["linear"], ["zoom"], 14.5, 0, 15.1, 0.92],
      },
    },

    // Warung Density Heatmap (WebGL)
    {
      id: "warungs-heatmap",
      type: "heatmap",
      source: "src-warungs",
      layout: { visibility: "none" },
      paint: {
        "heatmap-weight": 1,
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 13, 1.1, 17, 2.2],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(16, 185, 129, 0)",
          0.25,
          "rgba(16, 185, 129, 0.45)",
          0.55,
          "rgba(52, 211, 153, 0.7)",
          0.8,
          "rgba(251, 191, 36, 0.85)",
          1,
          "rgba(244, 63, 94, 0.92)",
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 13, 24, 16, 46],
        "heatmap-opacity": 0.82,
      },
    },

    // Catchment Buffer Overlay
    {
      id: "catchment-fill",
      type: "fill",
      source: "overlay-catchment",
      paint: {
        "fill-color": "#10b981",
        "fill-opacity": 0.16,
      },
    },
    {
      id: "catchment-outline",
      type: "line",
      source: "overlay-catchment",
      paint: {
        "line-color": "#34d399",
        "line-width": 2.5,
        "line-dasharray": [3, 2],
      },
    },

    // Nearest Warung Route Overlay (base glow + track + animated flowing dash)
    {
      id: "nearest-line-glow",
      type: "line",
      source: "overlay-nearest-line",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#0ea5e9",
        "line-width": 9,
        "line-opacity": 0.32,
      },
    },
    {
      id: "nearest-line",
      type: "line",
      source: "overlay-nearest-line",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#38bdf8",
        "line-width": 4,
      },
    },
    {
      id: "nearest-line-dash",
      type: "line",
      source: "overlay-nearest-line",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#f0f9ff",
        "line-width": 2.2,
        "line-dasharray": [0, 4, 3],
        "line-opacity": 0.92,
      },
    },

    // Interactive Measure Overlay
    {
      id: "measure-fill",
      type: "fill",
      source: "overlay-measure",
      filter: ["==", "$type", "Polygon"],
      paint: {
        "fill-color": "#fbbf24",
        "fill-opacity": 0.22,
      },
    },
    {
      id: "measure-line",
      type: "line",
      source: "overlay-measure",
      filter: ["==", "$type", "LineString"],
      paint: {
        "line-color": "#fde047",
        "line-width": 2.6,
        "line-dasharray": [2, 1.5],
      },
    },
    {
      id: "measure-vertices",
      type: "circle",
      source: "overlay-measure",
      filter: ["==", "$type", "Point"],
      paint: {
        "circle-radius": 5.5,
        "circle-color": "#facc15",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#0f172a",
      },
    },

    // Warung Ground Ring
    {
      id: "warungs-halo",
      type: "circle",
      source: "src-warungs",
      paint: {
        "circle-radius": 10,
        "circle-color": "#10b981",
        "circle-opacity": 0.2,
      },
    },
  ];
}
