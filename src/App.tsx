import { Loader2 } from "lucide-react";
import { useRef } from "react";
import { AboutModal } from "./components/AboutModal";
import { AnalysisCard } from "./components/AnalysisCard";
import { AnalysisToolbar } from "./components/AnalysisToolbar";
import { ExplorerPanel } from "./components/ExplorerPanel";
import { InsightsDrawer } from "./components/InsightsDrawer";
import { MapControls } from "./components/MapControls";
import { MiniLegend } from "./components/MiniLegend";
import { StoryModeOverlay } from "./components/StoryModeOverlay";
import { TopBar } from "./components/TopBar";
import { useI18n } from "./i18n/I18nContext";
import { MapCanvas, type MapCanvasHandle } from "./map/MapCanvas";
import { useAppState } from "./state/AppStateContext";

export default function App() {
  const mapRef = useRef<MapCanvasHandle | null>(null);
  const { t } = useI18n();
  const { loading, loadError, statusToast } = useAppState();

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#070c14]">
      <MapCanvas ref={mapRef} />

      <TopBar />
      <ExplorerPanel />
      <MapControls
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onResetView={() => mapRef.current?.resetView()}
      />

      <AnalysisCard />
      <AnalysisToolbar />
      <MiniLegend />
      <StoryModeOverlay />
      <InsightsDrawer />
      <AboutModal />

      {/* Initial dataset loading badge */}
      {loading && (
        <div
          role="status"
          className="glass-panel fixed left-1/2 top-20 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-4 py-2 text-xs font-medium text-slate-100"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
          <span>{t("status.loading")}</span>
        </div>
      )}

      {/* Load error alert */}
      {loadError && (
        <div
          role="alert"
          className="fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-2xl border border-rose-500/40 bg-rose-950/90 px-4 py-2.5 text-xs font-medium text-rose-100 shadow-xl"
        >
          {t("status.loadError")}
        </div>
      )}

      {/* Transient toast notification */}
      {statusToast && (
        <div
          role="status"
          className="glass-panel fixed left-1/2 top-[76px] z-40 -translate-x-1/2 rounded-full border-emerald-400/35 px-4 py-2 text-xs font-medium text-emerald-100"
        >
          {statusToast}
        </div>
      )}
    </div>
  );
}
