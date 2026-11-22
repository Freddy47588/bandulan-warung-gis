import { ExternalLink, Github, Map as MapIcon, X } from "lucide-react";
import { useEffect } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useAppState } from "../state/AppStateContext";

export function AboutModal() {
  const { t } = useI18n();
  const { aboutOpen, setAboutOpen } = useAppState();

  useEffect(() => {
    if (!aboutOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAboutOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen, setAboutOpen]);

  if (!aboutOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      onClick={() => setAboutOpen(false)}
    >
      <div
        className="glass-panel thin-scroll max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-500/15 text-emerald-300">
              <MapIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id="about-modal-title" className="text-lg font-bold text-slate-50">
                {t("about.title")}
              </h2>
              <p className="text-xs text-slate-400">
                Kelurahan Bandulan · Kecamatan Sukun · Malang, Indonesia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAboutOpen(false)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            aria-label={t("nav.closePanel")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-200">{t("about.lead")}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="glass-subtle rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t("about.workflowTitle")}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {t("about.workflowBody")}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-200">
              {["QGIS", "GeoJSON", "MapLibre GL JS", "Turf.js", "React", "TypeScript", "Tailwind"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-2 py-1"
                  >
                    {tech}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t("about.transparencyTitle")}
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-300">
              <li>{t("about.transparencyList1")}</li>
              <li>{t("about.transparencyList2")}</li>
              <li>{t("about.transparencyList3")}</li>
            </ul>
          </div>
        </div>

        {/* Preserved original QGIS cartographic layout */}
        <div className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t("about.layoutTitle")}
            </h3>
            <a
              href="/images/Layout_Peta_Bandulan.png"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:underline"
            >
              <span>{t("about.openFullLayout")}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <a
            href="/images/Layout_Peta_Bandulan.png"
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-slate-800"
          >
            <img
              src="/images/Layout_Peta_Bandulan.png"
              alt="Original QGIS thematic cartographic layout of Kelurahan Bandulan warung distribution"
              loading="lazy"
              className="h-auto w-full object-cover transition hover:scale-[1.01]"
            />
          </a>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <span>Basemaps: Esri World Imagery · Esri Dark/Light Canvas · OpenStreetMap</span>
          <a
            href="https://github.com/Freddy47588/bandulan-warung-gis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-200"
          >
            <Github className="h-3.5 w-3.5" />
            <span>{t("about.viewSource")}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
