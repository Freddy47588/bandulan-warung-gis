import { Layers, MapPin, Search, Store, X } from "lucide-react";
import { useMemo, useState } from "react";
import { LAYER_CATALOG, LAYER_GROUPS } from "../data/layers";
import { useI18n } from "../i18n/I18nContext";
import { searchGlobalIndex } from "../spatial/search";
import { useAppState } from "../state/AppStateContext";
import type { WarungCategory, WarungSource } from "../types/geo";
import { WarungDetailCard } from "./WarungDetailCard";

const SOURCES: Array<"all" | WarungSource> = ["all", "qgis", "osm"];
const CATEGORIES: Array<"all" | WarungCategory> = ["all", "food", "grocery", "cafe", "produce"];
const CATEGORY_DOTS: Record<WarungCategory, string> = {
  food: "#10b981",
  grocery: "#f59e0b",
  cafe: "#38bdf8",
  produce: "#84cc16",
};

export function ExplorerPanel() {
  const { t } = useI18n();
  const {
    sidebarOpen,
    setSidebarOpen,
    warungs,
    filteredWarungs,
    globalSearchIndex,
    warungSourceFilter,
    setWarungSourceFilter,
    warungCategoryFilter,
    setWarungCategoryFilter,
    datasets,
    selectedWarung,
    selectWarung,
    hoveredWarungId,
    setHoveredWarungId,
    visibleLayers,
    toggleLayer,
    applyLayerPreset,
    flyTo,
  } = useAppState();

  const [tab, setTab] = useState<"warungs" | "layers">("warungs");
  const [query, setQuery] = useState("");

  const visibleWarungList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredWarungs;
    return filteredWarungs.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        w.nearestRoad.name.toLowerCase().includes(q),
    );
  }, [filteredWarungs, query]);

  const otherFeatureHits = useMemo(() => {
    if (!query.trim()) return [];
    return searchGlobalIndex(globalSearchIndex, query)
      .filter((hit) => hit.kind !== "warung")
      .slice(0, 6);
  }, [globalSearchIndex, query]);

  const activeLayerCount = useMemo(
    () => Object.values(visibleLayers).filter(Boolean).length,
    [visibleLayers],
  );

  if (!sidebarOpen) return null;

  return (
    <aside
      className="glass-panel fixed bottom-20 left-3 top-[72px] z-20 flex w-[calc(100vw-24px)] max-w-[348px] flex-col overflow-hidden rounded-2xl lg:bottom-4"
      aria-label={t("nav.explorer")}
    >
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 p-2">
        <div className="grid flex-1 grid-cols-2 gap-1 rounded-xl bg-slate-950/60 p-1">
          <button
            type="button"
            onClick={() => setTab("warungs")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
              tab === "warungs"
                ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/35"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Store className="h-3.5 w-3.5" />
            <span>
              {t("explorer.warungsTab")} ({filteredWarungs.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("layers")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
              tab === "layers"
                ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/35"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>
              {t("explorer.layersTab")} ({activeLayerCount}/{LAYER_CATALOG.length})
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="ml-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800/80 hover:text-slate-100 lg:hidden"
          aria-label={t("nav.closePanel")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Panel Body */}
      <div className="thin-scroll flex-1 overflow-y-auto p-3">
        {tab === "warungs" ? (
          selectedWarung ? (
            <WarungDetailCard
              warung={selectedWarung}
              onBack={() => selectWarung(null, false)}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {/* Global Search Bar */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("explorer.searchPlaceholder")}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-950/75 py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-400 focus:border-emerald-400/70 focus:outline-none"
                />
              </div>

              {/* Source Filter (All / QGIS Survey / OSM) */}
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-950/60 p-1">
                {SOURCES.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setWarungSourceFilter(src)}
                    className={`rounded-lg py-1 text-[10px] font-semibold transition ${
                      warungSourceFilter === src
                        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/35"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t(`source.${src}`)}
                  </button>
                ))}
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setWarungCategoryFilter(cat)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-medium transition ${
                      warungCategoryFilter === cat
                        ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat !== "all" && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_DOTS[cat] }}
                      />
                    )}
                    <span>{t(`category.${cat}`)}</span>
                  </button>
                ))}
              </div>

              {/* Global Search Matches (Roads, Schools, Factories, Facilities) */}
              {otherFeatureHits.length > 0 && (
                <div className="space-y-1.5 rounded-xl border border-sky-500/25 bg-sky-500/8 p-2">
                  <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    {t("explorer.globalHits")}
                  </div>
                  <div className="grid gap-1">
                    {otherFeatureHits.map((hit) => (
                      <button
                        key={hit.id}
                        type="button"
                        onClick={() => flyTo(hit.coordinates, hit.zoom)}
                        className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-2.5 py-1.5 text-left text-xs text-slate-100 transition hover:bg-slate-800"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <MapPin className="h-3 w-3 shrink-0 text-sky-400" />
                          <span className="truncate font-medium">{hit.name}</span>
                        </span>
                        <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300">
                          {t(`searchKind.${hit.kind}` as Parameters<typeof t>[0])}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {t("explorer.showingCount", {
                    shown: visibleWarungList.length,
                    total: warungs.length,
                  })}
                </span>
              </div>

              {visibleWarungList.length === 0 && otherFeatureHits.length === 0 ? (
                <p className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-center text-xs text-slate-400">
                  {t("explorer.noResults")}
                </p>
              ) : (
                <ul className="grid gap-2">
                  {visibleWarungList.map((w) => {
                    const isHovered = hoveredWarungId === w.id;
                    return (
                      <li key={w.id}>
                        <button
                          type="button"
                          onClick={() => selectWarung(w.id, true)}
                          onMouseEnter={() => setHoveredWarungId(w.id)}
                          onMouseLeave={() => setHoveredWarungId(null)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            isHovered
                              ? "border-emerald-400/60 bg-emerald-500/12"
                              : "border-slate-700/50 bg-slate-900/60 hover:border-emerald-400/45 hover:bg-slate-800/75"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-50">
                              {w.name}
                            </span>
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                w.source === "qgis"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-teal-500/15 text-teal-300"
                              }`}
                            >
                              {w.source === "qgis" ? "QGIS" : "OSM"}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                            {w.address}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-300">
                            <span className="rounded-md bg-slate-950/75 px-1.5 py-0.5 text-emerald-200">
                              {t(`category.${w.category}`)}
                            </span>
                            <span className="rounded-md bg-slate-950/75 px-1.5 py-0.5">
                              {t("explorer.fromMainRoad", {
                                dist: w.nearestRoad.distanceMeters,
                              })}
                            </span>
                            <span className="rounded-md bg-slate-950/75 px-1.5 py-0.5">
                              {t("explorer.buildingsNearby", {
                                count: w.buildingsWithin250m,
                              })}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5">
              {(["default", "all", "minimal"] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyLayerPreset(preset)}
                  className="flex-1 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-200"
                >
                  {t(
                    preset === "default"
                      ? "explorer.presetDefault"
                      : preset === "all"
                        ? "explorer.presetAll"
                        : "explorer.presetMinimal",
                  )}
                </button>
              ))}
            </div>

            {LAYER_GROUPS.map((groupId) => {
              const items = LAYER_CATALOG.filter((l) => l.group === groupId);
              return (
                <fieldset key={groupId} className="space-y-1">
                  <legend className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t(`group.${groupId}`)}
                  </legend>
                  {items.map((layer) => {
                    const checked = visibleLayers[layer.id];
                    const count = datasets?.[layer.id]?.features.length ?? 0;
                    return (
                      <label
                        key={layer.id}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs transition ${
                          checked
                            ? "bg-slate-800/65 text-slate-100"
                            : "text-slate-400 hover:bg-slate-900/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLayer(layer.id)}
                          className="h-4 w-4 rounded accent-emerald-400"
                        />
                        <span
                          aria-hidden="true"
                          className={
                            layer.symbol === "point"
                              ? "h-3 w-3 shrink-0 rounded-full border-2 border-white"
                              : layer.symbol === "line"
                                ? "h-1 w-3.5 shrink-0 rounded-full"
                                : "h-3 w-3 shrink-0 rounded-sm border border-white/30"
                          }
                          style={{ backgroundColor: layer.color }}
                        />
                        <span className="flex-1 truncate font-medium">
                          {t(`layer.${layer.id}`)}
                        </span>
                        <span className="font-mono-num text-[10px] text-slate-400">
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
