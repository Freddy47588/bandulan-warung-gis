import {
  CircleDot,
  Compass,
  Hexagon,
  Navigation,
  Ruler,
} from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import { useAppState } from "../state/AppStateContext";
import type { AnalysisTool } from "../types/geo";

const TOOLS: Array<{ id: AnalysisTool; icon: typeof Compass }> = [
  { id: "explore", icon: Compass },
  { id: "catchment", icon: CircleDot },
  { id: "nearest", icon: Navigation },
  { id: "voronoi", icon: Hexagon },
  { id: "measure", icon: Ruler },
];

export function AnalysisToolbar() {
  const { t } = useI18n();
  const { activeTool, setActiveTool, sidebarOpen, insightsOpen, storyChapterIndex } = useAppState();

  if (storyChapterIndex !== null) return null;

  return (
    <nav
      aria-label="Spatial analysis tools"
      className={`pointer-events-none fixed bottom-3 z-20 flex w-full justify-center px-3 transition-all ${
        sidebarOpen ? "md:pl-[368px]" : ""
      } ${insightsOpen ? "lg:pr-[404px]" : ""}`}
    >
      <div className="glass-panel pointer-events-auto flex items-center gap-1 overflow-x-auto rounded-2xl p-1.5">
        {TOOLS.map(({ id, icon: Icon }) => {
          const active = activeTool === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTool(id)}
              aria-pressed={active}
              aria-label={t(`tool.${id}`)}
              title={t(`tool.${id}`)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${
                active
                  ? "bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/30"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t(`tool.${id}`)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
