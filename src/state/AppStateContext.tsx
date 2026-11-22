import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_VISIBLE_LAYERS, LAYER_CATALOG } from "../data/layers";
import { loadBandulanDatasets } from "../data/loadDatasets";
import { useI18n } from "../i18n/I18nContext";
import { computeCatchment } from "../spatial/catchment";
import { enrichWarungs } from "../spatial/enrichment";
import { computeSpatialInsights } from "../spatial/insights";
import { computeMeasurement } from "../spatial/measure";
import { findNearestWarung } from "../spatial/nearest";
import { buildRoadGraph, type RoadGraph } from "../spatial/routing";
import { buildGlobalSearchIndex } from "../spatial/search";
import { computeVoronoiAnalysis } from "../spatial/voronoi";
import { STORY_CHAPTERS } from "../story/chapters";
import type {
  AnalysisTool,
  BandulanDatasets,
  BasemapId,
  CatchmentRadius,
  CatchmentResult,
  EnrichedWarung,
  GlobalSearchHit,
  LayerId,
  MeasureMode,
  MeasureResult,
  NearestResult,
  RouteMode,
  SpatialInsights,
  VoronoiAnalysisResult,
  WarungCategory,
  WarungSource,
} from "../types/geo";
import { readInitialUrlState, writeUrlState } from "./useUrlState";

export interface CameraTarget {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
  nonce: number;
}

interface AppStateContextValue {
  loading: boolean;
  loadError: string | null;
  datasets: BandulanDatasets | null;
  warungs: EnrichedWarung[];
  filteredWarungs: EnrichedWarung[];
  globalSearchIndex: GlobalSearchHit[];
  insights: SpatialInsights | null;
  voronoiResult: VoronoiAnalysisResult | null;

  warungSourceFilter: "all" | WarungSource;
  setWarungSourceFilter: (f: "all" | WarungSource) => void;
  warungCategoryFilter: "all" | WarungCategory;
  setWarungCategoryFilter: (f: "all" | WarungCategory) => void;

  basemap: BasemapId;
  setBasemap: (bm: BasemapId) => void;
  is3D: boolean;
  setIs3D: (v: boolean) => void;
  toggle3D: () => void;
  heatmapOn: boolean;
  toggleHeatmap: () => void;

  visibleLayers: Record<LayerId, boolean>;
  toggleLayer: (id: LayerId) => void;
  applyLayerPreset: (preset: "default" | "all" | "minimal") => void;

  selectedWarungId: string | null;
  selectedWarung: EnrichedWarung | null;
  selectWarung: (id: string | null, flyTo?: boolean) => void;
  hoveredWarungId: string | null;
  setHoveredWarungId: (id: string | null) => void;

  activeTool: AnalysisTool;
  setActiveTool: (tool: AnalysisTool) => void;
  catchmentRadius: CatchmentRadius;
  setCatchmentRadius: (r: CatchmentRadius) => void;
  catchmentResult: CatchmentResult | null;

  routeMode: RouteMode;
  setRouteMode: (m: RouteMode) => void;
  nearestResult: NearestResult | null;
  runNearestAt: (coords: [number, number], source?: "click" | "gps") => void;
  clearNearest: () => void;

  measureMode: MeasureMode;
  setMeasureMode: (mode: MeasureMode) => void;
  measurePoints: [number, number][];
  measureResult: MeasureResult;
  addMeasurePoint: (coords: [number, number]) => void;
  undoMeasurePoint: () => void;
  clearMeasure: () => void;

  storyChapterIndex: number | null;
  startStory: () => void;
  exitStory: () => void;
  goToStoryChapter: (index: number) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  insightsOpen: boolean;
  setInsightsOpen: (open: boolean) => void;
  aboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;

  cameraTarget: CameraTarget | null;
  flyTo: (center: [number, number], zoom?: number, pitch?: number, bearing?: number) => void;
  resetViewNonce: number;
  triggerResetView: () => void;
  reportCamera: (cam: { lng: number; lat: number; zoom: number; pitch: number; bearing: number }) => void;
  initialUrlCamera: { lng: number; lat: number; zoom: number; pitch?: number; bearing?: number } | null;

  statusToast: string | null;
  showToast: (message: string, durationMs?: number) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const initialUrl = useMemo(() => readInitialUrlState(), []);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<BandulanDatasets | null>(null);
  const [warungs, setWarungs] = useState<EnrichedWarung[]>([]);
  const [globalSearchIndex, setGlobalSearchIndex] = useState<GlobalSearchHit[]>([]);
  const [insights, setInsights] = useState<SpatialInsights | null>(null);
  const [voronoiResult, setVoronoiResult] = useState<VoronoiAnalysisResult | null>(null);
  const roadGraphRef = useRef<RoadGraph | null>(null);

  const [warungSourceFilter, setWarungSourceFilter] = useState<"all" | WarungSource>("all");
  const [warungCategoryFilter, setWarungCategoryFilter] = useState<"all" | WarungCategory>("all");

  const [basemap, setBasemap] = useState<BasemapId>(initialUrl.basemap ?? "satellite");
  const [is3D, setIs3D] = useState<boolean>(initialUrl.is3D ?? false);
  const [heatmapOn, setHeatmapOn] = useState<boolean>(false);

  const [visibleLayers, setVisibleLayers] = useState<Record<LayerId, boolean>>(() => {
    if (initialUrl.layers) {
      const set = new Set(initialUrl.layers);
      return Object.fromEntries(
        LAYER_CATALOG.map((l) => [l.id, set.has(l.id)]),
      ) as Record<LayerId, boolean>;
    }
    return { ...DEFAULT_VISIBLE_LAYERS };
  });

  const [selectedWarungId, setSelectedWarungId] = useState<string | null>(initialUrl.warungId ?? null);
  const [hoveredWarungId, setHoveredWarungId] = useState<string | null>(null);
  const [activeTool, setActiveToolState] = useState<AnalysisTool>(initialUrl.tool ?? "explore");
  const [catchmentRadius, setCatchmentRadius] = useState<CatchmentRadius>(initialUrl.radius ?? 250);

  const [routeMode, setRouteModeState] = useState<RouteMode>("road");
  const [nearestOrigin, setNearestOrigin] = useState<{
    coords: [number, number];
    source: "click" | "gps";
  } | null>(null);

  const [measureMode, setMeasureModeState] = useState<MeasureMode>("distance");
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  const [storyChapterIndex, setStoryChapterIndex] = useState<number | null>(null);
  const savedBeforeStory = useRef<{
    visibleLayers: Record<LayerId, boolean>;
    is3D: boolean;
    tool: AnalysisTool;
    selectedWarungId: string | null;
  } | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const [cameraTarget, setCameraTarget] = useState<CameraTarget | null>(null);
  const [resetViewNonce, setResetViewNonce] = useState(0);
  const latestCameraRef = useRef<{
    lng: number;
    lat: number;
    zoom: number;
    pitch: number;
    bearing: number;
  } | null>(null);

  const [statusToast, setStatusToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, durationMs = 4200) => {
    setStatusToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setStatusToast(null), durationMs);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadBandulanDatasets()
      .then((loaded) => {
        if (cancelled) return;
        const enriched = enrichWarungs(loaded);
        const computedInsights = computeSpatialInsights(loaded);
        const computedVoronoi = computeVoronoiAnalysis(enriched, loaded);
        roadGraphRef.current = buildRoadGraph(loaded);
        const searchIdx = buildGlobalSearchIndex(enriched, loaded);

        setDatasets(loaded);
        setWarungs(enriched);
        setGlobalSearchIndex(searchIdx);
        setInsights(computedInsights);
        setVoronoiResult(computedVoronoi);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Unknown dataset error");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredWarungs = useMemo(
    () =>
      warungs.filter((w) => {
        if (warungSourceFilter !== "all" && w.source !== warungSourceFilter) return false;
        if (warungCategoryFilter !== "all" && w.category !== warungCategoryFilter) return false;
        return true;
      }),
    [warungs, warungSourceFilter, warungCategoryFilter],
  );

  const selectedWarung = useMemo(
    () => warungs.find((w) => w.id === selectedWarungId) ?? null,
    [warungs, selectedWarungId],
  );

  const catchmentResult = useMemo(() => {
    if (activeTool !== "catchment" || !selectedWarung || !datasets) return null;
    return computeCatchment(selectedWarung, catchmentRadius, datasets);
  }, [activeTool, selectedWarung, catchmentRadius, datasets]);

  const nearestResult = useMemo<NearestResult | null>(() => {
    if (!nearestOrigin || !warungs.length) return null;
    const pool = filteredWarungs.length ? filteredWarungs : warungs;
    return findNearestWarung(
      nearestOrigin.coords,
      pool,
      nearestOrigin.source,
      routeMode,
      roadGraphRef.current,
    );
  }, [nearestOrigin, warungs, filteredWarungs, routeMode]);

  const measureResult = useMemo(
    () => computeMeasurement(measureMode, measurePoints),
    [measureMode, measurePoints],
  );

  const flyTo = useCallback(
    (center: [number, number], zoom = 16.5, pitch?: number, bearing?: number) => {
      setCameraTarget({ center, zoom, pitch, bearing, nonce: Date.now() + Math.random() });
    },
    [],
  );

  const selectWarung = useCallback(
    (id: string | null, shouldFly = true) => {
      setSelectedWarungId(id);
      if (id) {
        setVisibleLayers((prev) => (prev.warungs ? prev : { ...prev, warungs: true }));
        if (shouldFly) {
          const target = warungs.find((w) => w.id === id);
          if (target) flyTo(target.coordinates, 16.6);
        }
      }
    },
    [warungs, flyTo],
  );

  const setActiveTool = useCallback(
    (tool: AnalysisTool) => {
      setActiveToolState(tool);
      if (tool !== "explore") {
        if (window.innerWidth < 768) setSidebarOpen(false);
        if (window.innerWidth < 1280) setInsightsOpen(false);
      }
      if (tool === "catchment" && !selectedWarungId && warungs.length > 0) {
        setSelectedWarungId(warungs[0].id);
        flyTo(warungs[0].coordinates, 16.0);
      }
      if (tool === "voronoi") {
        setVisibleLayers((prev) => ({ ...prev, warungs: true, boundary: true }));
      }
    },
    [selectedWarungId, warungs, flyTo],
  );

  const toggleLayer = useCallback((id: LayerId) => {
    setVisibleLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const applyLayerPreset = useCallback((preset: "default" | "all" | "minimal") => {
    if (preset === "default") {
      setVisibleLayers({ ...DEFAULT_VISIBLE_LAYERS });
      return;
    }
    if (preset === "all") {
      setVisibleLayers(
        Object.fromEntries(LAYER_CATALOG.map((l) => [l.id, true])) as Record<LayerId, boolean>,
      );
      return;
    }
    setVisibleLayers(
      Object.fromEntries(
        LAYER_CATALOG.map((l) => [l.id, l.id === "warungs" || l.id === "boundary"]),
      ) as Record<LayerId, boolean>,
    );
  }, []);

  const toggle3D = useCallback(() => setIs3D((prev) => !prev), []);
  const toggleHeatmap = useCallback(() => setHeatmapOn((prev) => !prev), []);

  const runNearestAt = useCallback((coords: [number, number], source: "click" | "gps" = "click") => {
    setNearestOrigin({ coords, source });
    setActiveToolState("nearest");
  }, []);

  const clearNearest = useCallback(() => setNearestOrigin(null), []);
  const setRouteMode = useCallback((m: RouteMode) => setRouteModeState(m), []);

  const setMeasureMode = useCallback((mode: MeasureMode) => {
    setMeasureModeState(mode);
    setMeasurePoints([]);
  }, []);

  const addMeasurePoint = useCallback((coords: [number, number]) => {
    setMeasurePoints((prev) => [...prev, coords]);
  }, []);

  const undoMeasurePoint = useCallback(() => {
    setMeasurePoints((prev) => prev.slice(0, -1));
  }, []);

  const clearMeasure = useCallback(() => setMeasurePoints([]), []);

  const applyStoryChapter = useCallback(
    (index: number) => {
      const chapter = STORY_CHAPTERS[index];
      if (!chapter) return;
      setStoryChapterIndex(index);
      const layerSet = new Set(chapter.visibleLayers);
      setVisibleLayers(
        Object.fromEntries(
          LAYER_CATALOG.map((l) => [l.id, layerSet.has(l.id)]),
        ) as Record<LayerId, boolean>,
      );
      setIs3D(chapter.is3D);
      setActiveToolState(chapter.tool);
      if (chapter.selectedWarungId) setSelectedWarungId(chapter.selectedWarungId);
      if (chapter.catchmentRadius) setCatchmentRadius(chapter.catchmentRadius);
      flyTo(
        chapter.camera.center,
        chapter.camera.zoom,
        chapter.camera.pitch,
        chapter.camera.bearing,
      );
    },
    [flyTo],
  );

  const startStory = useCallback(() => {
    savedBeforeStory.current = {
      visibleLayers: { ...visibleLayers },
      is3D,
      tool: activeTool,
      selectedWarungId,
    };
    setHoveredWarungId(null);
    setInsightsOpen(false);
    setAboutOpen(false);
    if (window.innerWidth < 1024) setSidebarOpen(false);
    applyStoryChapter(0);
  }, [visibleLayers, is3D, activeTool, selectedWarungId, applyStoryChapter]);

  const exitStory = useCallback(() => {
    setStoryChapterIndex(null);
    setHoveredWarungId(null);
    if (savedBeforeStory.current) {
      setVisibleLayers(savedBeforeStory.current.visibleLayers);
      setIs3D(savedBeforeStory.current.is3D);
      setActiveToolState(savedBeforeStory.current.tool);
      setSelectedWarungId(savedBeforeStory.current.selectedWarungId);
      savedBeforeStory.current = null;
    }
  }, []);

  const triggerResetView = useCallback(() => setResetViewNonce((n) => n + 1), []);

  const urlSyncTimerRef = useRef<number | null>(null);
  const syncUrlDebounced = useCallback(() => {
    if (urlSyncTimerRef.current) window.clearTimeout(urlSyncTimerRef.current);
    urlSyncTimerRef.current = window.setTimeout(() => {
      writeUrlState({
        locale,
        basemap,
        is3D,
        tool: activeTool,
        selectedWarungId,
        catchmentRadius,
        camera: latestCameraRef.current,
      });
    }, 350);
  }, [locale, basemap, is3D, activeTool, selectedWarungId, catchmentRadius]);

  useEffect(() => {
    syncUrlDebounced();
  }, [syncUrlDebounced]);

  const reportCamera = useCallback(
    (cam: { lng: number; lat: number; zoom: number; pitch: number; bearing: number }) => {
      latestCameraRef.current = cam;
      syncUrlDebounced();
    },
    [syncUrlDebounced],
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      loading,
      loadError,
      datasets,
      warungs,
      filteredWarungs,
      globalSearchIndex,
      insights,
      voronoiResult,
      warungSourceFilter,
      setWarungSourceFilter,
      warungCategoryFilter,
      setWarungCategoryFilter,
      basemap,
      setBasemap,
      is3D,
      setIs3D,
      toggle3D,
      heatmapOn,
      toggleHeatmap,
      visibleLayers,
      toggleLayer,
      applyLayerPreset,
      selectedWarungId,
      selectedWarung,
      selectWarung,
      hoveredWarungId,
      setHoveredWarungId,
      activeTool,
      setActiveTool,
      catchmentRadius,
      setCatchmentRadius,
      catchmentResult,
      routeMode,
      setRouteMode,
      nearestResult,
      runNearestAt,
      clearNearest,
      measureMode,
      setMeasureMode,
      measurePoints,
      measureResult,
      addMeasurePoint,
      undoMeasurePoint,
      clearMeasure,
      storyChapterIndex,
      startStory,
      exitStory,
      goToStoryChapter: applyStoryChapter,
      sidebarOpen,
      setSidebarOpen,
      insightsOpen,
      setInsightsOpen,
      aboutOpen,
      setAboutOpen,
      cameraTarget,
      flyTo,
      resetViewNonce,
      triggerResetView,
      reportCamera,
      initialUrlCamera: initialUrl.camera ?? null,
      statusToast,
      showToast,
    }),
    [
      loading,
      loadError,
      datasets,
      warungs,
      filteredWarungs,
      globalSearchIndex,
      insights,
      voronoiResult,
      warungSourceFilter,
      warungCategoryFilter,
      basemap,
      is3D,
      toggle3D,
      heatmapOn,
      toggleHeatmap,
      visibleLayers,
      toggleLayer,
      applyLayerPreset,
      selectedWarungId,
      selectedWarung,
      selectWarung,
      hoveredWarungId,
      activeTool,
      setActiveTool,
      catchmentRadius,
      catchmentResult,
      routeMode,
      setRouteMode,
      nearestResult,
      runNearestAt,
      clearNearest,
      measureMode,
      setMeasureMode,
      measurePoints,
      measureResult,
      addMeasurePoint,
      undoMeasurePoint,
      clearMeasure,
      storyChapterIndex,
      startStory,
      exitStory,
      applyStoryChapter,
      sidebarOpen,
      insightsOpen,
      aboutOpen,
      cameraTarget,
      flyTo,
      resetViewNonce,
      triggerResetView,
      reportCamera,
      initialUrl.camera,
      statusToast,
      showToast,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
