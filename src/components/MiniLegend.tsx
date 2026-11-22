import { ChevronDown, ListFilter } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useAppState } from "../state/AppStateContext";

export function MiniLegend() {
  const { t } = useI18n();
  const { insightsOpen, storyChapterIndex } = useAppState();
  const [open, setOpen] = useState(false);

  if (insightsOpen || storyChapterIndex !== null) return null;

  return (
    <div className="pointer-events-none fixed bottom-[82px] right-3 z-20 flex flex-col items-end gap-2">
      {open && (
        <div className="glass-panel pointer-events-auto w-56 rounded-2xl p-3 text-[11px]">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t("legend.warungCategories")}
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            {[
              { color: "#10b981", label: t("category.food") },
              { color: "#f59e0b", label: t("category.grocery") },
              { color: "#38bdf8", label: t("category.cafe") },
              { color: "#84cc16", label: t("category.produce") },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-slate-200">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/80"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="my-2.5 border-t border-slate-700/60" />

          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t("legend.supportingFacilities")}
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            {[
              { color: "#f472b6", label: t("amenity.worship") },
              { color: "#fb7185", label: t("amenity.health") },
              { color: "#38bdf8", label: t("amenity.civic") },
              { color: "#60a5fa", label: t("amenity.education") },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-slate-200">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="my-2.5 border-t border-slate-700/60" />

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              {t("source.qgis")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border border-white bg-emerald-500" />
              {t("source.osm")}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`glass-panel pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-semibold transition ${
          open
            ? "text-emerald-300 ring-1 ring-emerald-400/50"
            : "text-slate-200 hover:text-emerald-300"
        }`}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ListFilter className="h-3.5 w-3.5" />}
        <span>{t("legend.title")}</span>
      </button>
    </div>
  );
}
