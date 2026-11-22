import {
  Crosshair,
  Download,
  Route,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import { useAppState } from "../state/AppStateContext";
import type { CatchmentRadius } from "../types/geo";
import { exportCatchmentCsv, exportCatchmentGeoJson } from "../utils/exportData";

const RADII: CatchmentRadius[] = [100, 250, 500];

export function AnalysisCard() {
  const { t, formatNumber } = useI18n();
  const {
    activeTool,
    setActiveTool,
    sidebarOpen,
    insightsOpen,
    storyChapterIndex,
    catchmentRadius,
    setCatchmentRadius,
    catchmentResult,
    routeMode,
    setRouteMode,
    nearestResult,
    runNearestAt,
    clearNearest,
    voronoiResult,
    measureMode,
    setMeasureMode,
    measurePoints,
    measureResult,
    undoMeasurePoint,
    clearMeasure,
    selectWarung,
    flyTo,
    showToast,
  } = useAppState();

  if (storyChapterIndex !== null || activeTool === "explore") return null;

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      showToast(t("status.gpsUnsupported"));
      return;
    }
    showToast(t("status.gpsLocating"), 6000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        runNearestAt(coords, "gps");
        flyTo(coords, 16);
      },
      () => showToast(t("status.gpsDenied"), 5000),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <section
      className={`pointer-events-none fixed bottom-16 z-20 flex w-full justify-center px-3 transition-all ${
        sidebarOpen ? "md:pl-[368px]" : ""
      } ${insightsOpen ? "lg:pr-[404px]" : ""}`}
    >
      <div className="glass-panel pointer-events-auto w-full max-w-[460px] rounded-2xl p-3.5">
        {/* CATCHMENT */}
        {activeTool === "catchment" && (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {t("catchment.title")}
                </h2>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-50">
                  {catchmentResult ? catchmentResult.warungName : t("catchment.prompt")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {catchmentResult && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        exportCatchmentCsv(catchmentResult);
                        showToast(t("status.exported"), 2200);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 bg-slate-900/70 px-2 py-1 text-[10px] font-semibold text-slate-200 hover:border-emerald-400/50 hover:text-emerald-200"
                    >
                      <Download className="h-3 w-3" />
                      <span>{t("catchment.exportCsv")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        exportCatchmentGeoJson(catchmentResult);
                        showToast(t("status.exported"), 2200);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 bg-slate-900/70 px-2 py-1 text-[10px] font-semibold text-slate-200 hover:border-emerald-400/50 hover:text-emerald-200"
                    >
                      <Download className="h-3 w-3" />
                      <span>{t("catchment.exportGeoJson")}</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTool("explore")}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  aria-label={t("nav.closePanel")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">{t("catchment.radius")}</span>
              <div className="flex items-center gap-1 rounded-xl bg-slate-950/70 p-1">
                {RADII.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCatchmentRadius(r)}
                    className={`font-mono-num rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      catchmentRadius === r
                        ? "bg-emerald-400 text-slate-950"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {r}m
                  </button>
                ))}
              </div>
            </div>

            {catchmentResult && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: t("catchment.buildings"), value: catchmentResult.counts.buildings },
                  { label: t("catchment.amenities"), value: catchmentResult.counts.amenities },
                  { label: t("catchment.otherWarungs"), value: catchmentResult.counts.otherWarungs },
                  { label: t("catchment.schools"), value: catchmentResult.counts.schools },
                  { label: t("catchment.factories"), value: catchmentResult.counts.factories },
                  { label: t("catchment.green"), value: catchmentResult.counts.greenSpaces },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-subtle rounded-xl px-2.5 py-2 text-center"
                  >
                    <div className="font-mono-num text-base font-bold text-slate-50">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NEAREST (Dijkstra Road Route + Straight Line Toggle) */}
        {activeTool === "nearest" && (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  {t("nearest.title")}
                </h2>
                {!nearestResult && (
                  <p className="mt-1 text-xs text-slate-300">{t("nearest.prompt")}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={handleUseGps}
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-500/20 px-2 py-1 text-[11px] font-semibold text-sky-200 ring-1 ring-sky-400/35 hover:bg-sky-500/30"
                >
                  <Crosshair className="h-3 w-3" />
                  <span>{t("nearest.useGps")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool("explore")}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  aria-label={t("nav.closePanel")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Route mode switcher */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950/70 p-1">
              <button
                type="button"
                onClick={() => setRouteMode("road")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-semibold transition ${
                  routeMode === "road"
                    ? "bg-sky-400 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Route className="h-3.5 w-3.5" />
                <span>{t("nearest.roadRoute")}</span>
              </button>
              <button
                type="button"
                onClick={() => setRouteMode("straight")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-semibold transition ${
                  routeMode === "straight"
                    ? "bg-sky-400 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>{t("nearest.straightLine")}</span>
              </button>
            </div>

            {nearestResult && (
              <>
                <div className="glass-subtle flex items-center justify-between gap-3 rounded-xl p-3">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => selectWarung(nearestResult.nearest.id, true)}
                      className="truncate text-left text-sm font-semibold text-emerald-300 hover:underline"
                    >
                      {nearestResult.nearest.name}
                    </button>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {nearestResult.viaRoad
                        ? t("nearest.viaRoadNote", { min: nearestResult.nearest.walkMinutes })
                        : t("nearest.walkNote", { min: nearestResult.nearest.walkMinutes })}
                    </p>
                  </div>
                  <div className="font-mono-num shrink-0 rounded-xl bg-sky-500/15 px-3 py-1.5 text-sm font-bold text-sky-200">
                    {formatNumber(nearestResult.nearest.distanceMeters, 0)} m
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <span>{t("nearest.topThree")}</span>
                    <button
                      type="button"
                      onClick={clearNearest}
                      className="text-slate-400 hover:text-rose-300"
                    >
                      {t("nearest.clear")}
                    </button>
                  </div>
                  <div className="grid gap-1">
                    {nearestResult.topThree.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectWarung(item.id, true)}
                        className="flex items-center justify-between rounded-lg bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
                      >
                        <span className="truncate">
                          <span className="font-mono-num mr-2 text-slate-500">{idx + 1}.</span>
                          {item.name}
                        </span>
                        <span className="font-mono-num shrink-0 text-[11px] text-slate-400">
                          {formatNumber(item.distanceMeters, 0)} m
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* VORONOI & COVERAGE GAPS */}
        {activeTool === "voronoi" && voronoiResult && (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {t("voronoi.title")}
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                  {t("voronoi.description")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTool("explore")}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                aria-label={t("nav.closePanel")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="glass-subtle rounded-xl p-2 text-center">
                <div className="font-mono-num text-sm font-bold text-slate-50">
                  {formatNumber(voronoiResult.avgDistanceMeters, 0)} m
                </div>
                <div className="text-[10px] text-slate-400">{t("voronoi.avgDistance")}</div>
              </div>
              <div className="glass-subtle rounded-xl p-2 text-center">
                <div className="font-mono-num text-sm font-bold text-rose-300">
                  {formatNumber(voronoiResult.maxGapMeters, 0)} m
                </div>
                <div className="text-[10px] text-slate-400">{t("voronoi.maxGap")}</div>
              </div>
              <div className="glass-subtle rounded-xl p-2 text-center">
                <div className="font-mono-num text-sm font-bold text-rose-300">
                  {voronoiResult.underservedZones.features.length} / 15
                </div>
                <div className="text-[10px] text-slate-400">{t("voronoi.underservedCount")}</div>
              </div>
            </div>

            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {t("voronoi.largestTerritories")}
              </div>
              <div className="grid gap-1">
                {[...voronoiResult.territories.features]
                  .sort((a, b) => b.properties.areaHa - a.properties.areaHa)
                  .slice(0, 3)
                  .map((cell) => (
                    <button
                      key={cell.properties.warungId}
                      type="button"
                      onClick={() => selectWarung(cell.properties.warungId, true)}
                      className="flex items-center justify-between gap-2 rounded-lg bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ backgroundColor: cell.properties.color }}
                        />
                        <span className="truncate">{cell.properties.warungName}</span>
                      </span>
                      <span className="font-mono-num shrink-0 text-[11px] text-slate-400">
                        {formatNumber(cell.properties.areaHa, 1)} ha ·{" "}
                        {t("voronoi.buildingsShort", { count: cell.properties.buildingCount })}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE MEASURE */}
        {activeTool === "measure" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {t("measure.title")}
              </h2>
              <div className="flex items-center gap-1">
                <span className="font-mono-num rounded-md bg-slate-950/70 px-2 py-0.5 text-[10px] text-slate-300">
                  {t("measure.points", { count: measurePoints.length })}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTool("explore")}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  aria-label={t("nav.closePanel")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950/70 p-1">
                <button
                  type="button"
                  onClick={() => setMeasureMode("distance")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    measureMode === "distance"
                      ? "bg-amber-400 text-slate-950"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {t("measure.distance")}
                </button>
                <button
                  type="button"
                  onClick={() => setMeasureMode("area")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    measureMode === "area"
                      ? "bg-amber-400 text-slate-950"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {t("measure.area")}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={undoMeasurePoint}
                  disabled={measurePoints.length === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800 disabled:opacity-40"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{t("measure.undo")}</span>
                </button>
                <button
                  type="button"
                  onClick={clearMeasure}
                  disabled={measurePoints.length === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/15 disabled:opacity-40"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>{t("measure.clear")}</span>
                </button>
              </div>
            </div>

            {measurePoints.length < (measureMode === "distance" ? 2 : 3) ? (
              <p className="text-xs text-slate-300">
                {measureMode === "distance"
                  ? t("measure.hintDistance")
                  : t("measure.hintArea")}
              </p>
            ) : measureMode === "distance" ? (
              <div className="glass-subtle flex items-center justify-between rounded-xl px-3.5 py-2.5">
                <span className="text-xs text-slate-300">{t("measure.totalDistance")}</span>
                <span className="font-mono-num text-base font-bold text-amber-300">
                  {measureResult.totalDistanceMeters >= 1000
                    ? `${formatNumber(measureResult.totalDistanceMeters / 1000, 2)} km`
                    : `${formatNumber(measureResult.totalDistanceMeters, 0)} m`}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="glass-subtle rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-400">{t("measure.totalArea")}</div>
                  <div className="font-mono-num text-sm font-bold text-amber-300">
                    {measureResult.areaSqm >= 10000
                      ? `${formatNumber(measureResult.areaSqm / 10000, 2)} ha`
                      : `${formatNumber(measureResult.areaSqm, 0)} m²`}
                  </div>
                </div>
                <div className="glass-subtle rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-400">{t("measure.perimeter")}</div>
                  <div className="font-mono-num text-sm font-bold text-slate-100">
                    {formatNumber(measureResult.perimeterMeters, 0)} m
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
