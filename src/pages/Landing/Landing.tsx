import { useEffect, useRef, useState } from "react";
import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import { SCENE_IMAGES } from "../../assets/image/image";
import styles from "./Landing.module.css";

type Chapter = {
  num: string;
  title: string;
  theme: string;
  body: string;
  accent: "blue" | "pink" | "teal";
};

const CHAPTERS: Chapter[] = [
  {
    num: "01",
    title: "Sampling Bias",
    theme: "Data collection gaps",
    body: "Choose where the detective searches, who gets counted, and what evidence the model sees before it is deployed across the whole city.",
    accent: "blue",
  },
  {
    num: "02",
    title: "COMPAS Trade-offs",
    theme: "Fairness definitions collide",
    body: "Step into a criminal-justice risk system and test why equal treatment, equal error rates, and predictive accuracy cannot always be satisfied together.",
    accent: "pink",
  },
  {
    num: "03",
    title: "LLM Alignment",
    theme: "Human feedback shapes the model",
    body: "Rate model answers, watch the system learn from those choices, and see how majority preference can drown out harder truths.",
    accent: "teal",
  },
];

const TAKEAWAYS = [
  "Bias can enter before a model is trained, through who appears in the dataset and who is missing.",
  "A fairness rule can protect one value while quietly sacrificing another.",
  "Human feedback can make an AI sound helpful while teaching it whose judgment matters most.",
];

const SECTIONS = [
  { label: "Opening case", id: "top" },
  { label: "Mission briefing", id: "concept" },
  { label: "Chapters", id: "chapters" },
  { label: "Why it matters", id: "audience" },
  { label: "Case status", id: "case-status" },
];

const NAV_OFFSET = 88;
const SCROLL_DURATION_MS = 760;
const WHEEL_QUIET_MS = 220;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function Landing() {
  const animationFrameRef = useRef<number | null>(null);
  const wheelQuietTimerRef = useRef<number | null>(null);
  const wheelLockedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("landingPagedScroll");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const unlockWheelAfterQuiet = () => {
      if (wheelQuietTimerRef.current !== null) {
        window.clearTimeout(wheelQuietTimerRef.current);
      }

      wheelQuietTimerRef.current = window.setTimeout(() => {
        wheelLockedRef.current = false;
        wheelQuietTimerRef.current = null;
      }, WHEEL_QUIET_MS);
    };

    const getSectionTargets = () =>
      Array.from(document.querySelectorAll<HTMLElement>(`.${styles.pageSection}`)).map((section) =>
        Math.max(0, section.getBoundingClientRect().top + window.scrollY - NAV_OFFSET),
      );

    const getCurrentSectionIndex = (targets: number[], currentY = window.scrollY) =>
      targets.reduce((bestIndex, target, nextIndex) => {
        const bestDistance = Math.abs(targets[bestIndex] - currentY);
        const nextDistance = Math.abs(target - currentY);
        return nextDistance < bestDistance ? nextIndex : bestIndex;
      }, 0);

    const animateTo = (target: number, targetIndex?: number) => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (reduceMotion) {
        window.scrollTo(0, target);
        if (targetIndex !== undefined) setActiveSection(targetIndex);
        isAnimatingRef.current = false;
        return;
      }

      isAnimatingRef.current = true;
      if (targetIndex !== undefined) setActiveSection(targetIndex);
      const start = window.scrollY;
      const distance = target - start;
      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / SCROLL_DURATION_MS);
        window.scrollTo(0, start + distance * easeInOutCubic(progress));

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(tick);
          return;
        }

        animationFrameRef.current = null;
        isAnimatingRef.current = false;
        if (targetIndex !== undefined) setActiveSection(targetIndex);
      };

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    const updateActiveSection = () => {
      if (isAnimatingRef.current) return;

      const targets = getSectionTargets();
      if (!targets.length) return;

      setActiveSection(getCurrentSectionIndex(targets));
    };

    const onWheel = (event: WheelEvent) => {
      if (isAnimatingRef.current || wheelLockedRef.current) {
        event.preventDefault();
        unlockWheelAfterQuiet();
        return;
      }

      if (Math.abs(event.deltaY) < 12 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const targets = getSectionTargets();
      if (targets.length < 2) return;

      const currentIndex = getCurrentSectionIndex(targets);
      const nextIndex =
        event.deltaY > 0
          ? Math.min(currentIndex + 1, targets.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (nextIndex === currentIndex) return;

      event.preventDefault();
      wheelLockedRef.current = true;
      unlockWheelAfterQuiet();
      animateTo(targets[nextIndex], nextIndex);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    updateActiveSection();

    return () => {
      document.documentElement.classList.remove("landingPagedScroll");
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      if (wheelQuietTimerRef.current !== null) {
        window.clearTimeout(wheelQuietTimerRef.current);
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      wheelLockedRef.current = false;
      isAnimatingRef.current = false;
    };
  }, []);

  return (
    <>
      <Nav />
      <main id="top" className={styles.pagedMain}>
        <nav className={styles.progressDots} aria-label="Landing page sections">
          {SECTIONS.map((section, index) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.progressDot} ${activeSection === index ? styles.progressDotActive : ""}`}
              onClick={() => {
                if (isAnimatingRef.current) return;

                const target = document.getElementById(section.id);
                if (!target) return;
                const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET);
                const start = window.scrollY;
                const distance = top - start;
                const startTime = performance.now();

                if (animationFrameRef.current !== null) {
                  window.cancelAnimationFrame(animationFrameRef.current);
                }

                isAnimatingRef.current = true;
                setActiveSection(index);

                const tick = (now: number) => {
                  const progress = Math.min(1, (now - startTime) / SCROLL_DURATION_MS);
                  window.scrollTo(0, start + distance * easeInOutCubic(progress));
                  if (progress < 1) {
                    animationFrameRef.current = window.requestAnimationFrame(tick);
                    return;
                  }
                  animationFrameRef.current = null;
                  isAnimatingRef.current = false;
                  setActiveSection(index);
                };

                animationFrameRef.current = window.requestAnimationFrame(tick);
              }}
              aria-label={`Go to ${section.label}`}
              aria-current={activeSection === index ? "step" : undefined}
            >
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        <section className={`${styles.hero} ${styles.pageSection}`}>
          <div className={styles.text}>
            <p className="eyebrow">Case file: Novus AI justice system</p>
            <h1 className={styles.display}>Θmen</h1>
            <p className={styles.lede}>
              A future court trusts an AI to decide who is dangerous. When the
              machine condemns someone close to you, the only way forward is
              back: before the data was collected, before fairness was defined,
              before human feedback became machine judgment.
            </p>
            <div className={styles.ctaRow}>
              <Button variant="primary" to="/chapters?intro=story" id="start">
                Start investigation
              </Button>
              <Button variant="outline" href="#chapters">
                Review chapters
              </Button>
            </div>
          </div>

          <figure className={styles.heroMedia}>
            <img
              src={SCENE_IMAGES[7]}
              alt="A detective stands before a time machine in the city of Novus."
            />
            <figcaption className={styles.mediaCaption}>
              Back to before bias became a verdict.
            </figcaption>
          </figure>
        </section>

        <section className={`${styles.concept_section} ${styles.pageSection}`} id="concept">
          <div className={styles.concept_inner}>
            <p className="eyebrow eyebrow--light">Mission briefing</p>
            <h2 className="section__title">Bias is a chain<br />of decisions.</h2>
            <p className={styles.concept_lede}>
              Θmen turns AI fairness into a playable investigation. Each
              chapter sends you to a different point in the system's history:
              the data that was collected, the fairness rule the algorithm was
              asked to follow, and the human feedback that taught the model
              what counts as good.
            </p>
          </div>
        </section>

        <section className={`${styles.how_section} ${styles.pageSection}`} id="chapters">
          <p className="eyebrow">Three playable chapters</p>
          <h2 className="section__title section__title--dark">
            Three origins.<br />One unstable verdict.
          </h2>

          <div className={styles.how_cards}>
            {CHAPTERS.map((chapter) => (
              <article
                className={`${styles.how_card} ${styles[`how_accent_${chapter.accent}`]}`}
                key={chapter.num}
              >
                <div className={styles.how_num}>Chapter {chapter.num}</div>
                <h3 className={styles.how_title}>{chapter.title}</h3>
                <p className={styles.how_theme}>{chapter.theme}</p>
                <p className={styles.how_body}>{chapter.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.audience_section} ${styles.pageSection}`} id="audience">
          <div>
            <p className="eyebrow">Why it matters</p>
            <h2 className={`section__title section__title--dark ${styles.audience_title}`}>
              The machine<br />inherits more<br />than data.
            </h2>
            <p className={styles.audience_sub}>
              Built for non-CS students meeting AI fairness for the first time, Θmen makes abstract trade-offs visible through
              choices, consequences, and case evidence.
            </p>
          </div>
          <div>
            <ol className={styles.audience_goals}>
              {TAKEAWAYS.map((text, i) => (
                <li key={i}>
                  <span className={styles.audience_goalNum}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.audience_goalV}>{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${styles.cta_section} ${styles.pageSection}`} id="case-status">
          <div className={styles.ctaContent}>
            <p className={`eyebrow ${styles.cta_eyebrow}`}>Case status</p>
            <h2 className={styles.cta_title}>The past is still editable.</h2>
            <p className={styles.cta_sub}>
              Travel back through the AI pipeline and find where the verdict
              started to bend.
            </p>
            <Button variant="primary" size="lg" to="/chapters?intro=story">
              Start investigation
            </Button>
          </div>
          <Footer className={styles.ctaFooter} />
        </section>
      </main>
    </>
  );
}
