import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import Chapter1SamplingBias from "./Chapter1-SamplingBias/Chapter1SamplingBias";
import Chapter2COMPAS from "./Chapter2-COMPAS";
import Chapter3Alignment from "./Chapter3-Alignment/Chapter3Alignment";
import StoryIntro from "./components/StoryIntro/StoryIntro";
import styles from "./Chapters.module.css";

type ChapterId = "ch1" | "ch2" | "ch3";

type ChapterMeta = {
  id: ChapterId;
  num: string;
  title: string;
  hint: string;
  status: "ready" | "draft";
};

type ChapterResult = {
  completed: boolean;
  passed: boolean;
  scoreLabel?: string;
};

type EndingTier = "good" | "medium" | "bad";
type EndingRoute = EndingTier | "final";

const CHAPTERS: ChapterMeta[] = [
  { id: "ch1", num: "01", title: "Sampling Bias", hint: "Data collection shapes outcomes", status: "ready" },
  { id: "ch2", num: "02", title: "COMPAS Trade-offs", hint: "Fairness definitions collide", status: "ready" },
  { id: "ch3", num: "03", title: "LLM Alignment", hint: "Who teaches the model what's 'good'?", status: "ready" },
];

const PREVIEW_PASS_COUNT: Record<EndingTier, number> = {
  good: 3,
  medium: 2,
  bad: 1,
};

const isChapterId = (value: string | null): value is ChapterId =>
  value === "ch1" || value === "ch2" || value === "ch3";

const isEndingTier = (value: string | null): value is EndingTier =>
  value === "good" || value === "medium" || value === "bad";

const isEndingRoute = (value: string | null): value is EndingRoute =>
  value === "final" || isEndingTier(value);

const createPreviewResults = (passCount: number): Record<ChapterId, ChapterResult | null> => ({
  ch1: {
    completed: true,
    passed: passCount >= 1,
    scoreLabel: passCount >= 1 ? "Low Risk" : "Review needed",
  },
  ch2: {
    completed: true,
    passed: passCount >= 2,
    scoreLabel: passCount >= 2 ? "Fairness lesson complete" : "Review needed",
  },
  ch3: {
    completed: true,
    passed: passCount >= 3,
    scoreLabel: passCount >= 3 ? "honest-even" : "alignment drift",
  },
});

export default function Chapters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chapterParam = searchParams.get("chapter");
  const endingParam = searchParams.get("ending");
  const showStoryIntro = searchParams.get("intro") === "story";
  const initialChapter = isChapterId(chapterParam) ? chapterParam : "ch1";
  const [active, setActive] = useState<ChapterId>(initialChapter);
  const [visitedChapters, setVisitedChapters] = useState<Record<ChapterId, boolean>>({
    ch1: initialChapter === "ch1",
    ch2: initialChapter === "ch2",
    ch3: initialChapter === "ch3",
  });
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [chapterTutorialOverlayOpen, setChapterTutorialOverlayOpen] = useState(false);
  const [chapterResults, setChapterResults] = useState<Record<ChapterId, ChapterResult | null>>({
    ch1: null,
    ch2: null,
    ch3: null,
  });
  const [endingChooserOpen, setEndingChooserOpen] = useState(false);
  const chromeRef = useRef<HTMLDivElement>(null);
  const endingRef = useRef<HTMLDivElement>(null);
  const hasScrolledToEndingRef = useRef(false);

  const activeIndex = CHAPTERS.findIndex((c) => c.id === active);
  const progress = ((activeIndex + 0.5) / CHAPTERS.length) * 100;
  const completedResults = CHAPTERS.map((chapter) => chapterResults[chapter.id]);
  const isCaseComplete = completedResults.every(Boolean);
  const passCount = completedResults.filter((result) => result?.passed).length;
  const endingRoute = isEndingRoute(endingParam) ? endingParam : null;
  const isEndingPage = endingRoute !== null && (endingRoute !== "final" || isCaseComplete);
  const endingPagePassCount =
    endingRoute === "final" ? passCount : endingRoute ? PREVIEW_PASS_COUNT[endingRoute] : passCount;
  const endingPageResults =
    endingRoute === "final" ? chapterResults : createPreviewResults(endingPagePassCount);

  useEffect(() => {
    const chapter = searchParams.get("chapter");
    if (isChapterId(chapter) && chapter !== active) {
      setActive(chapter);
    }
  }, [active, searchParams]);

  useEffect(() => {
    setVisitedChapters((prev) => (prev[active] ? prev : { ...prev, [active]: true }));
  }, [active]);

  const selectChapter = (chapter: ChapterId) => {
    setActive(chapter);
    setChapterTutorialOverlayOpen(false);
    setEndingChooserOpen(false);
    setSearchParams({ chapter });
  };

  const selectEnding = (ending: EndingTier) => {
    setChapterTutorialOverlayOpen(false);
    setEndingChooserOpen(false);
    setTimelineOpen(false);
    setSearchParams({ ending });
    window.setTimeout(() => {
      endingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const recordChapterResult = (chapter: ChapterId, result: ChapterResult) => {
    setChapterResults((prev) => {
      if (prev[chapter]?.completed) return prev;
      return { ...prev, [chapter]: result };
    });
  };

  useEffect(() => {
    if (!isCaseComplete || hasScrolledToEndingRef.current) return;
    hasScrolledToEndingRef.current = true;
    const timer = window.setTimeout(() => {
      setSearchParams({ ending: "final" });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [isCaseComplete, setSearchParams]);

  useEffect(() => {
    if (!timelineOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!chromeRef.current?.contains(event.target as Node)) {
        setTimelineOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTimelineOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [timelineOpen]);

  return (
    <div className={styles.shell}>
      <div className={styles.chrome} ref={chromeRef}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <Logo />
            <button
              type="button"
              className={styles.timelineToggle}
              onClick={() => setTimelineOpen((o) => !o)}
              aria-expanded={timelineOpen}
              aria-controls="chapters-timeline"
              aria-label="Toggle chapters timeline"
            >
              <span className={`${styles.timelineToggleIcon} ${timelineOpen ? styles.timelineToggleIconOpen : ""}`} aria-hidden />
              Chapters
            </button>
          </div>
          <Link to="/" className={styles.backLink}>
            Back to case board
          </Link>
        </header>

        <div
          id="chapters-timeline"
          className={`${styles.timelineWrapper} ${timelineOpen ? styles.timelineWrapperOpen : ""}`}
        >
          <nav className={styles.timeline} aria-label="Chapters">
            <div className={styles.timelineTrack} aria-hidden>
              <div
                className={styles.timelineTrackFill}
                style={{ ["--progress" as string]: `${progress}%` }}
              />
            </div>
            <ol className={styles.timelineList}>
              {CHAPTERS.map((c, i) => {
                const isActive = c.id === active;
                const isPast = i < activeIndex;
                return (
                  <li key={c.id} className={styles.timelineItem}>
                    <button
                      type="button"
                      className={[
                        styles.timelineNode,
                        isPast ? styles.timelineNodePast : "",
                        isActive ? styles.timelineNodeActive : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => selectChapter(c.id)}
                      aria-current={isActive ? "step" : undefined}
                    >
                      <span className={styles.timelineDot} aria-hidden />
                      <span className={styles.timelineMeta}>
                        <span className={styles.timelineNum}>Chapter {c.num}</span>
                        <span className={styles.timelineTitle}>{c.title}</span>
                        <span className={styles.timelineHint}>{c.hint}</span>
                      </span>
                      {c.status === "draft" && (
                        <span className={styles.timelineBadge}>Classified</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
            {/* Debug for ending */}
            {/* <div className={styles.endingNavigator}>
              <button
                type="button"
                className={styles.endingNavigatorButton}
                onClick={() => setEndingChooserOpen((open) => !open)}
                aria-expanded={endingChooserOpen}
              >
                Ending preview
              </button>
              {endingChooserOpen && (
                <div className={styles.endingNavigatorMenu}>
                  {(["good", "medium", "bad"] as EndingTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      className={styles.endingNavigatorChoice}
                      onClick={() => selectEnding(tier)}
                    >
                      {tier === "good" ? "Good ending" : tier === "medium" ? "Medium ending" : "Bad ending"}
                    </button>
                  ))}
                </div>
              )}
            </div> */}
          </nav>
        </div>
      </div>

      <main
        className={`${styles.canvas} ${showStoryIntro ? styles.canvasIntro : ""} ${chapterTutorialOverlayOpen ? styles.canvasTutorialActive : ""} ${active === "ch3" && !isEndingPage ? styles.canvasChapter3 : ""}`}
      >
        <div className={styles.canvasBody}>
          {isEndingPage ? (
            <div ref={endingRef} className={styles.endingPage}>
              <EndingPanel
                mode={endingRoute === "final" ? "final" : "preview"}
                passCount={endingPagePassCount}
                chapterResults={endingPageResults}
                onReviewChapters={() => setTimelineOpen(true)}
              />
            </div>
          ) : showStoryIntro ? (
            <StoryIntro
              onStart={() => selectChapter("ch1")}
              onSelectChapter={selectChapter}
            />
          ) : (
            <>
              <section className={styles.chapterPanel} hidden={active !== "ch1"} aria-hidden={active !== "ch1"}>
                <Chapter1SamplingBias
                  isActive={active === "ch1"}
                  onTutorialOverlayOpenChange={setChapterTutorialOverlayOpen}
                  onChapterComplete={(result) => recordChapterResult("ch1", result)}
                />
              </section>
              {visitedChapters.ch2 && (
                <section className={styles.chapterPanel} hidden={active !== "ch2"} aria-hidden={active !== "ch2"}>
                  <Chapter2COMPAS
                    isActive={active === "ch2"}
                    onChapterComplete={(result) => recordChapterResult("ch2", result)}
                  />
                </section>
              )}
              {visitedChapters.ch3 && (
                <section className={styles.chapterPanel} hidden={active !== "ch3"} aria-hidden={active !== "ch3"}>
                  <Chapter3Alignment
                    isActive={active === "ch3"}
                    onChapterComplete={(result) => recordChapterResult("ch3", result)}
                  />
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function EndingPanel({
  passCount,
  chapterResults,
  onReviewChapters,
  mode = "final",
}: {
  passCount: number;
  chapterResults: Record<ChapterId, ChapterResult | null>;
  onReviewChapters: () => void;
  mode?: "final" | "preview";
}) {
  const tier = passCount === 3 ? "good" : passCount === 2 ? "medium" : "bad";
  const title = tier === "good" ? "Case Cleared" : tier === "medium" ? "Case Reopened" : "Case Unstable";
  const verdict =
    tier === "good"
      ? "You built a stronger record across data collection, fairness trade-offs, and alignment pressure. The system is not perfect, but it is ready for monitored deployment."
      : tier === "medium"
        ? "You solved part of the case, but one weak chapter still leaves the system exposed. Deployment needs another review before anyone relies on it."
        : "The case file is still dangerous. Too many failures remain across the pipeline, and the system should not be deployed.";

  return (
    <section className={`${styles.endingPanel} ${styles[`endingPanel_${tier}`]}`} aria-live="polite">
      <p className={styles.endingEyebrow}>{mode === "preview" ? "Ending preview" : "Final case review"}</p>
      <div className={styles.endingHeader}>
        <div>
          <h2 className={styles.endingTitle}>{title}</h2>
          <p className={styles.endingBody}>{verdict}</p>
        </div>
        <div className={styles.endingScore}>
          <strong>{passCount}/3</strong>
          <span>chapters passed</span>
        </div>
      </div>

      <div className={styles.endingGrid}>
        {CHAPTERS.map((chapter) => {
          const result = chapterResults[chapter.id];
          return (
            <article key={chapter.id} className={styles.endingCard}>
              <span className={styles.endingChapterNum}>Chapter {chapter.num}</span>
              <h3>{chapter.title}</h3>
              <p className={result?.passed ? styles.endingPass : styles.endingFail}>
                {result?.passed ? "Pass" : "Review needed"}
              </p>
              {result?.scoreLabel ? <span className={styles.endingDetail}>{result.scoreLabel}</span> : null}
            </article>
          );
        })}
      </div>

      <div className={styles.endingActions}>
        <button type="button" className={styles.endingButton} onClick={onReviewChapters}>
          Review chapters
        </button>
      </div>
    </section>
  );
}
