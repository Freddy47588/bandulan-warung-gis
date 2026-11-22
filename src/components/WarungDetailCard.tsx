import {
  ArrowLeft,
  Building2,
  CircleDot,
  Factory,
  GraduationCap,
  Landmark,
  MapPin,
  Navigation,
  Route,
  Store,
  Waves,
} from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import { useAppState } from "../state/AppStateContext";
import type { EnrichedWarung } from "../types/geo";

interface WarungDetailCardProps {
  warung: EnrichedWarung;
  onBack: () => void;
}

export function WarungDetailCard({ warung, onBack }: WarungDetailCardProps) {
  const { t, formatNumber } = useI18n();
  const { setActiveTool, flyTo } = useAppState();

  const metrics = [
    {
      icon: Route,
      label: t("detail.nearestRoad"),
      value: warung.nearestRoad.name,
      dist: `${formatNumber(warung.nearestRoad.distanceMeters, 0)} m`,
      tone: "text-amber-300",
    },
    {
      icon: Landmark,
      label: t("detail.nearestAmenity"),
      value: warung.nearestAmenity.name,
      dist: `${formatNumber(warung.nearestAmenity.distanceMeters, 0)} m`,
      tone: "text-pink-300",
    },
    {
      icon: GraduationCap,
      label: t("detail.nearestSchool"),
      value: warung.nearestSchool.name,
      dist: `${formatNumber(warung.nearestSchool.distanceMeters, 0)} m`,
      tone: "text-sky-300",
    },
    {
      icon: Factory,
      label: t("detail.nearestFactory"),
      value: warung.nearestFactory.name,
      dist: `${formatNumber(warung.nearestFactory.distanceMeters, 0)} m`,
      tone: "text-violet-300",
    },
    {
      icon: Waves,
      label: t("detail.nearestRiver"),
      value: warung.nearestRiver.name,
      dist: `${formatNumber(warung.nearestRiver.distanceMeters, 0)} m`,
      tone: "text-cyan-300",
    },
    {
      icon: Store,
      label: t("detail.nearestWarung"),
      value: warung.nearestWarung.name,
      dist: `${formatNumber(warung.nearestWarung.distanceMeters, 0)} m`,
      tone: "text-emerald-300",
    },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-800/80 hover:text-emerald-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{t("detail.backToList")}</span>
      </button>

      <div className="glass-subtle rounded-xl p-3.5">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <MapPin className="h-3 w-3" />
            <span>#{warung.id}</span>
          </span>
          <span
            className={`rounded-md px-1.5 py-0.5 ${
              warung.source === "qgis"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-teal-500/15 text-teal-300"
            }`}
          >
            {t(`source.${warung.source}`)}
          </span>
          <span className="rounded-md bg-slate-800/80 px-1.5 py-0.5 text-slate-200">
            {t(`category.${warung.category}`)}
          </span>
        </div>

        <h2 className="text-base font-semibold leading-snug text-slate-50">
          {warung.name}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
          {warung.address}
        </p>

        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-950/60 px-2.5 py-2 text-[11px]">
          <span className="text-slate-400">{t("detail.coordinates")}</span>
          <span className="font-mono-num text-slate-200">
            {warung.coordinates[1].toFixed(5)}, {warung.coordinates[0].toFixed(5)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTool("catchment")}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            <CircleDot className="h-3.5 w-3.5" />
            <span className="truncate">{t("tool.catchment")}</span>
          </button>
          <button
            type="button"
            onClick={() => flyTo(warung.coordinates, 17.2)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-100 transition hover:border-emerald-400/50 hover:text-emerald-200"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span className="truncate">{t("detail.centerMap")}</span>
          </button>
        </div>
      </div>

      {/* Building density highlight */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-100">
          <Building2 className="h-4 w-4 text-emerald-400" />
          <span>{t("detail.buildings250m")}</span>
        </div>
        <span className="font-mono-num text-sm font-bold text-emerald-300">
          {warung.buildingsWithin250m}
        </span>
      </div>

      {/* Factual spatial context */}
      <div>
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t("detail.spatialContext")}
        </h3>
        <div className="grid min-w-0 gap-1.5">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="glass-subtle flex min-w-0 items-start justify-between gap-2 overflow-hidden rounded-xl px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Icon className={`h-3 w-3 shrink-0 ${m.tone}`} />
                    <span className="truncate">{m.label}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-100" title={m.value}>
                    {m.value}
                  </p>
                </div>
                <span className="font-mono-num shrink-0 rounded-md bg-slate-950/70 px-1.5 py-0.5 text-[11px] font-medium text-slate-200">
                  {m.dist}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
