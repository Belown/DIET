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

const CHAPTERS: ChapterMeta[] = [
  { id: "ch1", num: "01", title: "Sampling Bias", hint: "Data collection shapes outcomes", status: "ready" },
  { id: "ch2", num: "02", title: "COMPAS Trade-offs", hint: "Fairness definitions collide", status: "ready" },
  { id: "ch3", num: "03", title: "LLM Alignment", hint: "Who teaches the model what's 'good'?", status: "ready" },
];

const isChapterId = (value: string | null): value is ChapterId =>
  value === "ch1" || value === "ch2" || value === "ch3";

export default function Chapters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chapterParam = searchParams.get("chapter");
  const showStoryIntro = searchParams.get("intro") === "story";
  const initialChapter = isChapterId(chapterParam) ? chapterParam : "ch1";
  const [active, setActive] = useState<ChapterId>(initialChapter);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const chromeRef = useRef<HTMLDivElement>(null);

  const activeIndex = CHAPTERS.findIndex((c) => c.id === active);
  const progress = ((activeIndex + 0.5) / CHAPTERS.length) * 100;

  useEffect(() => {
    const chapter = searchParams.get("chapter");
    if (isChapterId(chapter) && chapter !== active) {
      setActive(chapter);
    }
  }, [active, searchParams]);

  const selectChapter = (chapter: ChapterId) => {
    setActive(chapter);
    setSearchParams({ chapter });
  };

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
          </nav>
        </div>
      </div>

      <main className={`${styles.canvas} ${showStoryIntro ? styles.canvasIntro : ""}`}>
        <div key={showStoryIntro ? "story-intro" : active} className={styles.canvasBody}>
          {showStoryIntro ? (
            <StoryIntro
              onStart={() => selectChapter("ch1")}
              onSelectChapter={selectChapter}
            />
          ) : (
            <>
              {active === "ch1" && <Chapter1SamplingBias />}
              {active === "ch2" && <Chapter2COMPAS />}
              {active === "ch3" && <Chapter3Alignment />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
