import type { StyleSpecification } from "maplibre-gl";
import type { BasemapId } from "../types/geo";
import { BASEMAP_THEMES } from "./themePalette";

export interface BasemapConfig {
  id: BasemapId;
  tiles: string[];
  attribution: string;
  tileSize: number;
  maxzoom: number;
  swatch: string;
}

export const BASEMAPS: BasemapConfig[] = [
  {
    id: "satellite",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution:
      "Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    tileSize: 256,
    maxzoom: 19,
    swatch: "linear-gradient(135deg, #1b3428 0%, #314b3c 50%, #1c2c38 100%)",
  },
  {
    id: "dark",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Tiles &copy; Esri, HERE, Garmin, OpenStreetMap contributors",
    tileSize: 256,
    maxzoom: 16,
    swatch: "linear-gradient(135deg, #0b111b 0%, #1a2433 100%)",
  },
  {
    id: "light",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Tiles &copy; Esri, HERE, Garmin, OpenStreetMap contributors",
    tileSize: 256,
    maxzoom: 16,
    swatch: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
  },
  {
    id: "osm",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    tileSize: 256,
    maxzoom: 19,
    swatch: "linear-gradient(135deg, #d7e4cc 0%, #f3efe4 55%, #b6d3e8 100%)",
  },
];

export function createBaseStyle(initialBasemap: BasemapId): StyleSpecification {
  const sources: StyleSpecification["sources"] = {};
  const layers: StyleSpecification["layers"] = [
    {
      id: "canvas-bg",
      type: "background",
      paint: {
        "background-color": "#070c14",
      },
    },
  ];

  for (const bm of BASEMAPS) {
    sources[`basemap-${bm.id}`] = {
      type: "raster",
      tiles: bm.tiles,
      tileSize: bm.tileSize,
      maxzoom: bm.maxzoom,
      attribution: bm.attribution,
    };

    layers.push({
      id: `basemap-layer-${bm.id}`,
      type: "raster",
      source: `basemap-${bm.id}`,
      layout: {
        visibility: bm.id === initialBasemap ? "visible" : "none",
      },
      paint: {
        "raster-opacity": 1,
        "raster-fade-duration": 200,
      },
    });
  }

  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sky: BASEMAP_THEMES[initialBasemap].sky,
    light: {
      anchor: "viewport",
      color: "#ffffff",
      intensity: 0.45,
      position: [1.15, 210, 35],
    },
    sources,
    layers,
  };
}
