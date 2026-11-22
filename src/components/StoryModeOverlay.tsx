import { ArrowLeft, ArrowRight, BookOpen, Check, X } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import { useAppState } from "../state/AppStateContext";
import { STORY_CHAPTERS } from "../story/chapters";

export function StoryModeOverlay() {
  const { t } = useI18n();
  const { storyChapterIndex, goToStoryChapter, exitStory } = useAppState();

  if (storyChapterIndex === null) return null;

  const chapter = STORY_CHAPTERS[storyChapterIndex];
  const isFirst = storyChapterIndex === 0;
  const isLast = storyChapterIndex === STORY_CHAPTERS.length - 1;

  return (
    <section
      aria-label={t("story.badge")}
      className="pointer-events-none fixed inset-x-3 bottom-4 z-30 flex justify-center"
    >
      <div className="glass-panel pointer-events-auto w-full max-w-[540px] rounded-2xl p-4 sm:p-5">
        {/* Progress bar */}
        <div className="mb-3 flex items-center gap-1.5">
          {STORY_CHAPTERS.map((ch, idx) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => goToStoryChapter(idx)}
              aria-label={t("story.stepOf", {
                current: idx + 1,
                total: STORY_CHAPTERS.length,
              })}
              className={`h-1.5 flex-1 rounded-full transition ${
                idx <= storyChapterIndex ? "bg-emerald-400" : "bg-slate-700/80 hover:bg-slate-600"
              }`}
            />
          ))}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            <BookOpen className="h-3.5 w-3.5" />
            <span>
              {t("story.stepOf", {
                current: storyChapterIndex + 1,
                total: STORY_CHAPTERS.length,
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={exitStory}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label={t("nav.exitStory")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-1.5 text-base font-semibold text-slate-50 sm:text-lg">
          {t(chapter.titleKey)}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
          {t(chapter.bodyKey)}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => goToStoryChapter(storyChapterIndex - 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("story.prev")}</span>
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={exitStory}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{t("story.finish")}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goToStoryChapter(storyChapterIndex + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              <span>{t("story.next")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
