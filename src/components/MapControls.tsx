import {
  Box,
  Compass,
  Crosshair,
  Flame,
  Layers,
  Minus,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { BANDULAN_BOUNDS } from "../data/layers";
import { useI18n } from "../i18n/I18nContext";
import { BASEMAPS } from "../map/basemaps";
import { useAppState } from "../state/AppStateContext";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onResetView }: MapControlsProps) {
  const { t } = useI18n();
  const {
    basemap,
    setBasemap,
    is3D,
    toggle3D,
    heatmapOn,
    toggleHeatmap,
    insightsOpen,
    runNearestAt,
    flyTo,
    showToast,
  } = useAppState();
  const [basemapMenuOpen, setBasemapMenuOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  if (insightsOpen) return null;

  const handleLocate = () => {
    if (!navigator.geolocation) {
      showToast(t("status.gpsUnsupported"));
      return;
    }
    setLocating(true);
    showToast(t("status.gpsLocating"), 8000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        runNearestAt(coords, "gps");
        flyTo(coords, 16);
        const [[minLng, minLat], [maxLng, maxLat]] = BANDULAN_BOUNDS;
        const inside =
          coords[0] >= minLng &&
          coords[0] <= maxLng &&
          coords[1] >= minLat &&
          coords[1] <= maxLat;
        showToast(inside ? t("status.gpsFound") : t("status.gpsOutside"), 5500);
      },
      () => {
        setLocating(false);
        showToast(t("status.gpsDenied"), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className="pointer-events-none fixed right-3 top-[72px] z-20 flex flex-col items-end gap-2">
      {/* Basemap Popover Switcher */}
      <div className="pointer-events-auto relative">
        <button
          type="button"
          onClick={() => setBasemapMenuOpen((v) => !v)}
          className={`glass-panel inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
            basemapMenuOpen
              ? "text-emerald-300 ring-1 ring-emerald-400/50"
              : "text-slate-100 hover:text-emerald-300"
          }`}
          aria-expanded={basemapMenuOpen}
          aria-label={t("controls.basemap")}
        >
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">{t(`basemap.${basemap}`)}</span>
        </button>

        {basemapMenuOpen && (
          <div className="glass-panel absolute right-0 top-12 w-44 rounded-2xl p-2">
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t("controls.basemap")}
            </div>
            <div className="grid gap-1">
              {BASEMAPS.map((bm) => {
                const active = bm.id === basemap;
                return (
                  <button
                    key={bm.id}
                    type="button"
                    onClick={() => {
                      setBasemap(bm.id);
                      setBasemapMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition ${
                      active
                        ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
                        : "text-slate-200 hover:bg-slate-800/70"
                    }`}
                  >
                    <span
                      className="h-5 w-5 shrink-0 rounded-md border border-white/25"
                      style={{ background: bm.swatch }}
                    />
                    <span>{t(`basemap.${bm.id}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2D / 3D Toggle */}
      <button
        type="button"
        onClick={toggle3D}
        className={`glass-panel pointer-events-auto inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold tracking-wide transition ${
          is3D
            ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/60"
            : "text-slate-200 hover:text-emerald-300"
        }`}
        aria-pressed={is3D}
        aria-label={t("controls.toggle3D")}
        title={t("controls.toggle3D")}
      >
        <Box className="h-4 w-4" />
        <span>{is3D ? "3D" : "2D"}</span>
      </button>

      {/* Warung Density Heatmap Toggle */}
      <button
        type="button"
        onClick={toggleHeatmap}
        className={`glass-panel pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
          heatmapOn
            ? "bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/60"
            : "text-slate-200 hover:text-amber-300"
        }`}
        aria-pressed={heatmapOn}
        aria-label={t("controls.heatmap")}
        title={t("controls.heatmap")}
      >
        <Flame className="h-4 w-4" />
      </button>

      {/* Zoom, Reset, Locate stack */}
      <div className="glass-panel pointer-events-auto flex flex-col overflow-hidden rounded-xl">
        <button
          type="button"
          onClick={onZoomIn}
          className="inline-flex h-9 w-10 items-center justify-center border-b border-slate-700/50 text-slate-200 transition hover:bg-slate-800/70 hover:text-emerald-300"
          aria-label={t("controls.zoomIn")}
          title={t("controls.zoomIn")}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="inline-flex h-9 w-10 items-center justify-center border-b border-slate-700/50 text-slate-200 transition hover:bg-slate-800/70 hover:text-emerald-300"
          aria-label={t("controls.zoomOut")}
          title={t("controls.zoomOut")}
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onResetView}
          className="inline-flex h-9 w-10 items-center justify-center border-b border-slate-700/50 text-slate-200 transition hover:bg-slate-800/70 hover:text-emerald-300"
          aria-label={t("controls.reset")}
          title={t("controls.reset")}
        >
          <Compass className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex h-9 w-10 items-center justify-center text-slate-200 transition hover:bg-slate-800/70 hover:text-emerald-300 disabled:opacity-50"
          aria-label={t("controls.locate")}
          title={t("controls.locate")}
        >
          <Crosshair className={`h-4 w-4 ${locating ? "animate-spin text-emerald-300" : ""}`} />
        </button>
      </div>

      {is3D && (
        <div className="glass-panel pointer-events-auto rounded-lg px-2 py-1 text-[10px] text-slate-300">
          {t("controls.schematic3D")}
        </div>
      )}
    </div>
  );
}
