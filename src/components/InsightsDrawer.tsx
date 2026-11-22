import { BarChart3, Download, Waves, X } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import { useAppState } from "../state/AppStateContext";
import { exportInsightsCsv } from "../utils/exportData";

export function InsightsDrawer() {
  const { t, formatNumber } = useI18n();
  const { insights, warungs, insightsOpen, setInsightsOpen, showToast } = useAppState();

  if (!insightsOpen || !insights) return null;

  const maxRoadKm = Math.max(...insights.roadBreakdown.map((r) => r.lengthKm), 1);
  const maxLandHa = Math.max(...insights.landUseBreakdown.map((l) => l.areaHa), 1);
  const maxAmenity = Math.max(...insights.amenityBreakdown.map((a) => a.count), 1);

  return (
    <aside
      aria-label={t("insights.title")}
      className="glass-panel fixed bottom-4 right-3 top-[72px] z-30 flex w-[calc(100vw-24px)] max-w-[390px] flex-col overflow-hidden rounded-2xl"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-700/50 p-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Turf.js Analytics</span>
          </div>
          <h2 className="mt-1 text-base font-semibold text-slate-50">
            {t("insights.title")}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">{t("insights.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setInsightsOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
          aria-label={t("nav.closePanel")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="thin-scroll flex-1 space-y-5 overflow-y-auto p-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass-subtle rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {t("insights.studyArea")}
            </div>
            <div className="font-mono-num mt-1 text-lg font-bold text-slate-50">
              {formatNumber(insights.boundaryAreaHa, 1)}{" "}
              <span className="text-xs font-normal text-slate-400">ha</span>
            </div>
          </div>

          <div className="glass-subtle rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {t("insights.warungDensity")}
            </div>
            <div className="font-mono-num mt-1 text-lg font-bold text-emerald-300">
              {formatNumber(insights.warungDensityPerKm2, 1)}{" "}
              <span className="text-xs font-normal text-slate-400">/ km²</span>
            </div>
          </div>

          <div className="glass-subtle rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {t("insights.totalRoads")}
            </div>
            <div className="font-mono-num mt-1 text-lg font-bold text-amber-300">
              {formatNumber(insights.totalRoadKm, 1)}{" "}
              <span className="text-xs font-normal text-slate-400">km</span>
            </div>
          </div>

          <div className="glass-subtle rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {t("insights.avgSpacing")}
            </div>
            <div className="font-mono-num mt-1 text-lg font-bold text-sky-300">
              {formatNumber(insights.nearestNeighborAvgM, 0)}{" "}
              <span className="text-xs font-normal text-slate-400">m</span>
            </div>
          </div>
        </div>

        {/* Warung Sources Banner */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 text-[11px] font-medium text-emerald-200">
          {t("insights.warungSources", {
            total: insights.warungCount,
            qgis: insights.qgisWarungCount,
            osm: insights.osmWarungCount,
          })}
        </div>

        {/* Road Network Breakdown Bar Chart */}
        <section>
          <h3 className="mb-2.5 text-xs font-semibold text-slate-200">
            {t("insights.roadBreakdown")}
          </h3>
          <div className="space-y-2.5">
            {insights.roadBreakdown.map((item) => {
              const pct = Math.max(4, (item.lengthKm / maxRoadKm) * 100);
              return (
                <div key={item.layerId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200">{t(`layer.${item.layerId}`)}</span>
                    <span className="font-mono-num text-[11px] text-slate-300">
                      {formatNumber(item.lengthKm, 2)} km{" "}
                      <span className="text-slate-500">
                        ({t("insights.segments", { count: item.featureCount })})
                      </span>
                    </span>
                  </div>
                  <svg className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80" viewBox="0 0 100 4" preserveAspectRatio="none">
                    <rect x="0" y="0" width={pct} height="4" rx="2" fill={item.color} />
                  </svg>
                </div>
              );
            })}
          </div>
        </section>

        {/* Supporting Facilities Breakdown */}
        {insights.amenityBreakdown.length > 0 && (
          <section>
            <h3 className="mb-2.5 text-xs font-semibold text-slate-200">
              {t("insights.amenitiesTitle", { count: insights.amenityCount })}
            </h3>
            <div className="space-y-2.5">
              {insights.amenityBreakdown.map((item) => {
                const pct = Math.max(6, (item.count / maxAmenity) * 100);
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-200">{t(`amenity.${item.type}`)}</span>
                      <span className="font-mono-num text-[11px] text-slate-300">
                        {item.count}
                      </span>
                    </div>
                    <svg className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80" viewBox="0 0 100 4" preserveAspectRatio="none">
                      <rect x="0" y="0" width={pct} height="4" rx="2" fill={item.color} />
                    </svg>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Land-Use Composition */}
        <section>
          <h3 className="mb-2.5 text-xs font-semibold text-slate-200">
            {t("insights.landUse")}
          </h3>
          <div className="space-y-2.5">
            {insights.landUseBreakdown.map((item) => {
              const pct = Math.max(4, (item.areaHa / maxLandHa) * 100);
              return (
                <div key={item.layerId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200">{t(`layer.${item.layerId}`)}</span>
                    <span className="font-mono-num text-[11px] text-slate-300">
                      {formatNumber(item.areaHa, 2)} ha{" "}
                      <span className="text-slate-500">({item.shareOfBoundaryPct}%)</span>
                    </span>
                  </div>
                  <svg className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80" viewBox="0 0 100 4" preserveAspectRatio="none">
                    <rect x="0" y="0" width={pct} height="4" rx="2" fill={item.color} />
                  </svg>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contextual Notes + Export CSV */}
        <div className="space-y-2 rounded-xl border border-slate-700/50 bg-slate-950/60 p-3 text-[11px] leading-relaxed text-slate-300">
          <div className="flex items-start gap-2">
            <Waves className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
            <span>
              {t("insights.riverNote", { km: formatNumber(insights.riverLengthKm, 2) })}
            </span>
          </div>
          <p className="text-slate-400">
            {t("insights.spacingNote", {
              min: formatNumber(insights.nearestNeighborMinM, 0),
              max: formatNumber(insights.nearestNeighborMaxM, 0),
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            exportInsightsCsv(insights, warungs);
            showToast(t("status.exported"), 2400);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          <Download className="h-4 w-4" />
          <span>{t("insights.exportCsv")}</span>
        </button>
      </div>
    </aside>
  );
}
