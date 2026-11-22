import type { SkySpecification } from "maplibre-gl";
import type { BasemapId } from "../types/geo";

export interface BasemapCartoTheme {
  spotlightColor: string;
  spotlightOpacity: number;
  sky: SkySpecification;
  buildingsFillColor: string;
  buildingsFillOpacity: number;
  buildingsOutlineColor: string;
  buildings3DLow: string;
  buildings3DHigh: string;
  buildings3DOpacity: number;
  villageRoadColor: string;
  villageRoadCasing: string;
  residentialRoadColor: string;
  alleyRoadColor: string;
  alleyRoadOpacity: number;
  villageLabelColor: string;
  villageLabelHalo: string;
  residentialLabelColor: string;
  residentialLabelHalo: string;
  boundaryColor: string;
  boundaryGlow: string;
}

export const BASEMAP_THEMES: Record<BasemapId, BasemapCartoTheme> = {
  satellite: {
    spotlightColor: "#070c14",
    spotlightOpacity: 0.56,
    sky: {
      "sky-color": "#091322",
      "horizon-color": "#16263b",
      "fog-color": "#0d1726",
      "sky-horizon-blend": 0.65,
      "horizon-fog-blend": 0.75,
      "fog-ground-blend": 0.42,
    },
    buildingsFillColor: "#cbd5e1",
    buildingsFillOpacity: 0.28,
    buildingsOutlineColor: "#e2e8f0",
    buildings3DLow: "#94a3b8",
    buildings3DHigh: "#cbd5e1",
    buildings3DOpacity: 0.82,
    villageRoadColor: "#f59e0b",
    villageRoadCasing: "#0f172a",
    residentialRoadColor: "#fbbf24",
    alleyRoadColor: "#cbd5e1",
    alleyRoadOpacity: 0.55,
    villageLabelColor: "#ffffff",
    villageLabelHalo: "rgba(7, 12, 20, 0.92)",
    residentialLabelColor: "#fef3c7",
    residentialLabelHalo: "rgba(7, 12, 20, 0.9)",
    boundaryColor: "#5eead4",
    boundaryGlow: "#2dd4bf",
  },
  dark: {
    // Smart City Dark cartography: deep indigo-cyan 3D massing + glowing amber arterials
    spotlightColor: "#04070e",
    spotlightOpacity: 0.64,
    sky: {
      "sky-color": "#040812",
      "horizon-color": "#0e2238",
      "fog-color": "#071120",
      "sky-horizon-blend": 0.7,
      "horizon-fog-blend": 0.8,
      "fog-ground-blend": 0.5,
    },
    buildingsFillColor: "#2dd4bf",
    buildingsFillOpacity: 0.22,
    buildingsOutlineColor: "#5eead4",
    buildings3DLow: "#1e3a5f",
    buildings3DHigh: "#2dd4bf",
    buildings3DOpacity: 0.86,
    villageRoadColor: "#fbbf24",
    villageRoadCasing: "#451a03",
    residentialRoadColor: "#f59e0b",
    alleyRoadColor: "#64748b",
    alleyRoadOpacity: 0.65,
    villageLabelColor: "#fef3c7",
    villageLabelHalo: "rgba(4, 7, 14, 0.95)",
    residentialLabelColor: "#cbd5e1",
    residentialLabelHalo: "rgba(4, 7, 14, 0.92)",
    boundaryColor: "#2dd4bf",
    boundaryGlow: "#14b8a6",
  },
  light: {
    // Editorial Light cartography: crisp warm slate buildings + dark labels with white halos
    spotlightColor: "#e2e8f0",
    spotlightOpacity: 0.65,
    sky: {
      "sky-color": "#cbd5e1",
      "horizon-color": "#e2e8f0",
      "fog-color": "#f1f5f9",
      "sky-horizon-blend": 0.65,
      "horizon-fog-blend": 0.75,
      "fog-ground-blend": 0.35,
    },
    buildingsFillColor: "#64748b",
    buildingsFillOpacity: 0.34,
    buildingsOutlineColor: "#475569",
    buildings3DLow: "#94a3b8",
    buildings3DHigh: "#475569",
    buildings3DOpacity: 0.85,
    villageRoadColor: "#d97706",
    villageRoadCasing: "#ffffff",
    residentialRoadColor: "#ea580c",
    alleyRoadColor: "#64748b",
    alleyRoadOpacity: 0.55,
    villageLabelColor: "#0f172a",
    villageLabelHalo: "rgba(255, 255, 255, 0.95)",
    residentialLabelColor: "#334155",
    residentialLabelHalo: "rgba(255, 255, 255, 0.92)",
    boundaryColor: "#0f766e",
    boundaryGlow: "#14b8a6",
  },
  osm: {
    spotlightColor: "#e2e8f0",
    spotlightOpacity: 0.54,
    sky: {
      "sky-color": "#cbd5e1",
      "horizon-color": "#e2e8f0",
      "fog-color": "#f1f5f9",
      "sky-horizon-blend": 0.65,
      "horizon-fog-blend": 0.75,
      "fog-ground-blend": 0.35,
    },
    buildingsFillColor: "#475569",
    buildingsFillOpacity: 0.3,
    buildingsOutlineColor: "#334155",
    buildings3DLow: "#94a3b8",
    buildings3DHigh: "#475569",
    buildings3DOpacity: 0.84,
    villageRoadColor: "#d97706",
    villageRoadCasing: "#ffffff",
    residentialRoadColor: "#f59e0b",
    alleyRoadColor: "#64748b",
    alleyRoadOpacity: 0.5,
    villageLabelColor: "#0f172a",
    villageLabelHalo: "rgba(255, 255, 255, 0.96)",
    residentialLabelColor: "#334155",
    residentialLabelHalo: "rgba(255, 255, 255, 0.92)",
    boundaryColor: "#0f766e",
    boundaryGlow: "#14b8a6",
  },
};
