import {
  BarChart3,
  BookOpen,
  Check,
  Info,
  Map as MapIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useAppState } from "../state/AppStateContext";

export function TopBar() {
  const { locale, setLocale, t } = useI18n();
  const {
    sidebarOpen,
    setSidebarOpen,
    insightsOpen,
    setInsightsOpen,
    setAboutOpen,
    storyChapterIndex,
    startStory,
    exitStory,
    showToast,
  } = useAppState();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast(t("nav.copied"), 2600);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      showToast(window.location.href, 4000);
    }
  };

  const inStory = storyChapterIndex !== null;

  return (
    <header className="pointer-events-none fixed inset-x-3 top-3 z-30 flex items-center justify-between gap-2">
      {/* Left: Explorer Toggle + Brand */}
      <div className="glass-panel pointer-events-auto flex items-center gap-2 rounded-2xl px-2.5 py-2">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/70 text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-300"
          aria-label={sidebarOpen ? t("nav.closePanel") : t("nav.openExplorer")}
          aria-expanded={sidebarOpen}
          title={t("nav.explorer")}
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2 pr-1 sm:gap-2.5 sm:pr-1.5">
          <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-400/35 bg-emerald-500/15 text-emerald-300 sm:flex">
            <MapIcon className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <h1 className="whitespace-nowrap text-xs font-semibold tracking-tight text-slate-50 sm:text-sm">
              <span className="sm:hidden">Bandulan GIS</span>
              <span className="hidden sm:inline">{t("brand.title")}</span>
            </h1>
            <p className="hidden text-[11px] text-slate-400 sm:block">
              {t("brand.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Story Mode CTA, Insights, Share, EN|ID, About */}
      <div className="glass-panel pointer-events-auto flex items-center gap-1.5 rounded-2xl p-1.5">
        <button
          type="button"
          onClick={inStory ? exitStory : startStory}
          aria-label={inStory ? t("nav.exitStory") : t("nav.storyMode")}
          title={inStory ? t("nav.exitStory") : t("nav.storyMode")}
          className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition sm:px-3 ${
            inStory
              ? "bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/40 hover:bg-rose-500/30"
              : "bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/30 hover:bg-emerald-300"
          }`}
        >
          {inStory ? <X className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">
            {inStory ? t("nav.exitStory") : t("nav.storyMode")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setInsightsOpen(!insightsOpen)}
          className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition ${
            insightsOpen
              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
              : "text-slate-200 hover:bg-slate-800/80"
          }`}
          aria-expanded={insightsOpen}
          aria-label={t("nav.insights")}
          title={t("nav.insights")}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden md:inline">{t("nav.insights")}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="hidden h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800/80 sm:inline-flex"
          aria-label={copied ? t("nav.copied") : t("nav.share")}
          title={t("nav.share")}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          <span className="hidden lg:inline">
            {copied ? t("nav.copied") : t("nav.share")}
          </span>
        </button>

        <div
          className="flex items-center rounded-xl border border-slate-700/60 bg-slate-950/70 p-0.5 text-[11px] font-semibold"
          role="group"
          aria-label="Language"
        >
          <button
            type="button"
            onClick={() => setLocale("en")}
            aria-pressed={locale === "en"}
            className={`rounded-lg px-2 py-1 transition ${
              locale === "en"
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("id")}
            aria-pressed={locale === "id"}
            className={`rounded-lg px-2 py-1 transition ${
              locale === "id"
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ID
          </button>
        </div>

        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-200 transition hover:bg-slate-800/80 hover:text-emerald-300"
          aria-label={t("nav.about")}
          title={t("nav.about")}
        >
          <Info className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
