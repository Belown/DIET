import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../Logo/Logo";
import { hasCompleted } from "../../utils/assessmentStorage";
import styles from "./InvestigationNav.module.css";

const STEPS = [
  { id: "pre",  num: "Assessment", title: "Pre-Test",          hint: "Test your intuitions",           url: "/assessment" },
  { id: "ch1",  num: "Chapter 01", title: "Sampling Bias",     hint: "Data collection shapes outcomes", url: "/chapters?chapter=ch1" },
  { id: "ch2",  num: "Chapter 02", title: "COMPAS Trade-offs", hint: "Fairness definitions collide",    url: "/chapters?chapter=ch2" },
  { id: "ch3",  num: "Chapter 03", title: "LLM Alignment",     hint: "Who teaches the model what's 'good'?", url: "/chapters?chapter=ch3" },
  { id: "post", num: "Assessment", title: "Post-Test",         hint: "Reflect on what you learned",    url: "/assessment?mode=post" },
];

export default function InvestigationNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const chromeRef = useRef<HTMLDivElement>(null);

  const isPost = location.search.includes("mode=post");
  const preComplete = hasCompleted("pre");
  const postComplete = hasCompleted("post");

  useEffect(() => {
    if (!open) return;
    const closeOutside = (e: PointerEvent) => {
      if (!chromeRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const closeEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEsc);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEsc);
    };
  }, [open]);

  return (
    <div className={styles.chrome} ref={chromeRef}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Logo />
          <button
            type="button"
            className={styles.chaptersBtn}
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
          >
            <span className={`${styles.chaptersIcon} ${open ? styles.chaptersIconOpen : ""}`} aria-hidden />
            Chapters
          </button>
        </div>
        <Link to="/" className={styles.backLink}>
          Back to case board
        </Link>
      </header>

      <div className={`${styles.timelineWrapper} ${open ? styles.timelineWrapperOpen : ""}`}>
        <nav className={styles.timeline} aria-label="Chapters">
          <ol className={styles.timelineList}>
            {STEPS.map((step) => {
              const isDone  = (step.id === "pre" && preComplete) || (step.id === "post" && postComplete);
              const isActive = (step.id === "pre" && !isPost) || (step.id === "post" && isPost);
              return (
                <li key={step.id} className={styles.timelineItem}>
                  <button
                    type="button"
                    className={[
                      styles.timelineNode,
                      isDone   ? styles.timelineNodePast   : "",
                      isActive ? styles.timelineNodeActive : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => { navigate(step.url); setOpen(false); }}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className={styles.timelineDot} aria-hidden />
                    <span className={styles.timelineMeta}>
                      <span className={styles.timelineNum}>{step.num}</span>
                      <span className={styles.timelineTitle}>{step.title}</span>
                      <span className={styles.timelineHint}>{step.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
