import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import Chapter1Placeholder from "./Chapter1-Placeholder/Chapter1Placeholder";
import Chapter2SamplingBias from "./Chapter2-SamplingBias/Chapter2SamplingBias";
import Chapter3Placeholder from "./Chapter3-Placeholder/Chapter3Placeholder";
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
  { id: "ch1", num: "01", title: "TBD", hint: "TBD", status: "draft" },
  { id: "ch2", num: "02", title: "Sampling Bias",          hint: "Data collection shapes outcomes", status: "ready" },
  { id: "ch3", num: "03", title: "TBD",      hint: "TBD", status: "draft" },
];

export default function Chapters() {
  const [active, setActive] = useState<ChapterId>("ch2");

  const activeIndex = CHAPTERS.findIndex((c) => c.id === active);
  const progress = ((activeIndex + 0.5) / CHAPTERS.length) * 100;

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Logo />
        <Link to="/" className={styles.backLink}>
          ← Back to landing
        </Link>
      </header>

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
                  onClick={() => setActive(c.id)}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className={styles.timelineDot} aria-hidden />
                  <span className={styles.timelineMeta}>
                    <span className={styles.timelineNum}>Chapter {c.num}</span>
                    <span className={styles.timelineTitle}>{c.title}</span>
                    <span className={styles.timelineHint}>{c.hint}</span>
                  </span>
                  {c.status === "draft" && (
                    <span className={styles.timelineBadge}>Soon</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <main className={styles.canvas}>
        <div key={active} className={styles.canvasBody}>
          {active === "ch1" && <Chapter1Placeholder />}
          {active === "ch2" && <Chapter2SamplingBias />}
          {active === "ch3" && <Chapter3Placeholder />}
        </div>
      </main>
    </div>
  );
}
