import { LAYER_CATALOG } from "../data/layers";
import type { AnalysisTool, BasemapId, CatchmentRadius, LayerId } from "../types/geo";
import type { Locale } from "../i18n/messages";

export interface ParsedUrlState {
  basemap?: BasemapId;
  is3D?: boolean;
  tool?: AnalysisTool;
  warungId?: string;
  radius?: CatchmentRadius;
  camera?: {
    lng: number;
    lat: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
  layers?: LayerId[];
}

const VALID_BASEMAPS = new Set<BasemapId>(["satellite", "dark", "light", "osm"]);
const VALID_TOOLS = new Set<AnalysisTool>(["explore", "catchment", "nearest", "voronoi", "measure"]);
const VALID_RADII = new Set<CatchmentRadius>([100, 250, 500]);
const VALID_LAYERS = new Set<LayerId>(LAYER_CATALOG.map((l) => l.id));

export function readInitialUrlState(): ParsedUrlState {
  const params = new URLSearchParams(window.location.search);
  const parsed: ParsedUrlState = {};

  const bm = params.get("basemap") as BasemapId | null;
  if (bm && VALID_BASEMAPS.has(bm)) parsed.basemap = bm;

  const mode3d = params.get("3d");
  if (mode3d === "1" || mode3d === "true") parsed.is3D = true;
  if (mode3d === "0" || mode3d === "false") parsed.is3D = false;

  const tool = params.get("tool") as AnalysisTool | null;
  if (tool && VALID_TOOLS.has(tool)) parsed.tool = tool;

  const warungId = params.get("warung");
  if (warungId) parsed.warungId = warungId;

  const radius = Number(params.get("r")) as CatchmentRadius;
  if (VALID_RADII.has(radius)) parsed.radius = radius;

  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const zoom = Number(params.get("z"));
  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Number.isFinite(zoom) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    zoom >= 1 &&
    zoom <= 22
  ) {
    const pitch = Number(params.get("p"));
    const bearing = Number(params.get("b"));
    parsed.camera = {
      lat,
      lng,
      zoom,
      pitch: Number.isFinite(pitch) ? pitch : undefined,
      bearing: Number.isFinite(bearing) ? bearing : undefined,
    };
  }

  const layersParam = params.get("layers");
  if (layersParam !== null) {
    parsed.layers = layersParam
      .split(",")
      .map((s) => s.trim() as LayerId)
      .filter((id) => VALID_LAYERS.has(id));
  }

  return parsed;
}

export function writeUrlState(state: {
  locale: Locale;
  basemap: BasemapId;
  is3D: boolean;
  tool: AnalysisTool;
  selectedWarungId: string | null;
  catchmentRadius: CatchmentRadius;
  camera: { lng: number; lat: number; zoom: number; pitch: number; bearing: number } | null;
}) {
  const params = new URLSearchParams();
  params.set("lang", state.locale);
  if (state.basemap !== "satellite") params.set("basemap", state.basemap);
  if (state.is3D) params.set("3d", "1");
  if (state.tool !== "explore") params.set("tool", state.tool);
  if (state.selectedWarungId) params.set("warung", state.selectedWarungId);
  if (state.tool === "catchment") params.set("r", String(state.catchmentRadius));
  if (state.camera) {
    params.set("lat", state.camera.lat.toFixed(5));
    params.set("lng", state.camera.lng.toFixed(5));
    params.set("z", state.camera.zoom.toFixed(2));
    if (Math.round(state.camera.pitch) !== 0) params.set("p", String(Math.round(state.camera.pitch)));
    if (Math.round(state.camera.bearing) !== 0) params.set("b", String(Math.round(state.camera.bearing)));
  }

  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", nextUrl);
}
