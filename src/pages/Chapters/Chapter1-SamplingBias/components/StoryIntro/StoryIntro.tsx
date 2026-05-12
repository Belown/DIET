import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import HTMLFlipBook from "react-pageflip";
import styles from "./StoryIntro.module.css";
import { STORY_SCENES } from "./storyIntroScenes";

type StoryIntroProps = {
  onStart: () => void;
  onSelectChapter: (chapter: "ch1" | "ch2" | "ch3") => void;
};

const PORTALS = [
  {
    id: "ch1",
    num: "01",
    title: "Sampling Bias",
    body: "Follow the evidence trail into Novus data collection.",
    tone: "warm",
  },
  {
    id: "ch2",
    num: "02",
    title: "Algorithmic Bias",
    body: "Step into the courtroom where definitions decide outcomes.",
    tone: "mixed",
  },
  {
    id: "ch3",
    num: "03",
    title: "Human-in-the-Loop Bias",
    body: "Enter the feedback chamber where people teach the machine.",
    tone: "cold",
  },
] as const;

type FlipCorner = "top" | "bottom";

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: (corner?: FlipCorner) => void;
    flipPrev: (corner?: FlipCorner) => void;
    turnToPage: (page: number) => void;
  };
};

type BookPageProps = {
  className: string;
  children: ReactNode;
};

const BookPage = forwardRef<HTMLDivElement, BookPageProps>(({ className, children }, ref) => (
  <div className={className} ref={ref}>
    {children}
  </div>
));

BookPage.displayName = "BookPage";

const FINAL_SCENE_INDEX = STORY_SCENES.length - 1;
const LAST_BOOK_SCENE_INDEX = FINAL_SCENE_INDEX - 1;
const BOOK_SCENES = STORY_SCENES.slice(0, FINAL_SCENE_INDEX);
const getBookPageForScene = (index: number) => index * 2;

export default function StoryIntro({ onStart, onSelectChapter }: StoryIntroProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);
  const flipBookRef = useRef<FlipBookHandle | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioStartTokenRef = useRef(0);
  const typewriterTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const pendingBookPageRef = useRef<number | null>(null);
  const scene = STORY_SCENES[sceneIndex];
  const isLast = sceneIndex === FINAL_SCENE_INDEX;
  const isLastBookScene = sceneIndex === LAST_BOOK_SCENE_INDEX;

  const clearSceneTimers = () => {
    if (typewriterTimerRef.current !== null) {
      window.clearInterval(typewriterTimerRef.current);
      typewriterTimerRef.current = null;
    }
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const stopCurrentAudio = () => {
    audioStartTokenRef.current += 1;
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  };

  const formattedText = useMemo(() => {
    if (!scene.text) return "";
    return scene.text
      .split(/(?<=[.!?])\s+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }, [scene.text]);

  useEffect(() => {
    setTypedText("");
    setIsNarrating(false);
    clearSceneTimers();
    stopCurrentAudio();
    if (isLast) return;
    const startToken = audioStartTokenRef.current;
    let i = 0;
    let timer: number | null = null;
    let fallbackTimer: number | null = null;
    let started = false;

    const startTypewriter = (tickMs: number) => {
      if (started) return;
      started = true;
      timer = window.setInterval(() => {
        typewriterTimerRef.current = timer;
        i += 1;
        setTypedText(formattedText.slice(0, i));
        if (i >= formattedText.length && timer !== null) {
          window.clearInterval(timer);
          typewriterTimerRef.current = null;
          timer = null;
        }
      }, tickMs);
      typewriterTimerRef.current = timer;
    };

    const sceneAudioSrc = scene.audio;
    if (sceneAudioSrc) {
      setIsNarrating(true);
      const sceneAudio = new Audio(sceneAudioSrc);
      audioRef.current = sceneAudio;
      sceneAudio.preload = "auto";

      const startScene = (tickMs: number) => {
        if (startToken !== audioStartTokenRef.current) return;
        if (fallbackTimer !== null) {
          window.clearTimeout(fallbackTimer);
          fallbackTimerRef.current = null;
          fallbackTimer = null;
        }
        startTypewriter(tickMs);
        void sceneAudio?.play().catch(() => {
          // Ignore autoplay blocks; typewriter still runs.
          setIsNarrating(false);
        });
      };

      const handleAudioEnded = () => {
        if (startToken === audioStartTokenRef.current) {
          setIsNarrating(false);
        }
      };

      const handleLoadedMetadata = () => {
        if (startToken !== audioStartTokenRef.current) return;
        const durationMs = Number.isFinite(sceneAudio?.duration)
          ? (sceneAudio?.duration ?? 0) * 1000
          : 0;
        const chars = Math.max(formattedText.length, 1);
        const matchedTick = durationMs > 0
          ? Math.min(80, Math.max(10, Math.round(durationMs / chars)))
          : 18;
        startScene(matchedTick);
      };

      sceneAudio.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
      sceneAudio.addEventListener("ended", handleAudioEnded, { once: true });
      sceneAudio.load();
      fallbackTimer = window.setTimeout(() => startScene(18), 300);
      fallbackTimerRef.current = fallbackTimer;
    } else {
      startTypewriter(18);
    }

    return () => {
      if (timer !== null) window.clearInterval(timer);
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      if (typewriterTimerRef.current === timer) typewriterTimerRef.current = null;
      if (fallbackTimerRef.current === fallbackTimer) fallbackTimerRef.current = null;
      stopCurrentAudio();
    };
  }, [formattedText, isLast, scene.audio, sceneIndex]);

  useEffect(() => {
    return () => {
      clearSceneTimers();
      stopCurrentAudio();
    };
  }, []);

  const isCurrentPageComplete = typedText.length >= formattedText.length && !isNarrating;
  const canTurnPage = !isLast && !isFlipping && isCurrentPageComplete;
  const canFinishCurrentPage = !isLast && !isFlipping && !isCurrentPageComplete;

  const finishCurrentPage = () => {
    clearSceneTimers();
    stopCurrentAudio();
    setIsNarrating(false);
    setTypedText(formattedText);
  };

  const skipToFinalScene = () => {
    setIsFlipping(false);
    pendingBookPageRef.current = null;
    stopCurrentAudio();
    setSceneIndex(FINAL_SCENE_INDEX);
  };

  const enterPortal = (chapter: "ch1" | "ch2" | "ch3") => {
    stopCurrentAudio();
    if (chapter === "ch1") {
      onStart();
      return;
    }
    onSelectChapter(chapter);
  };

  const openChapterPicker = () => {
    setChapterPickerOpen(true);
  };

  const goPrevPage = () => {
    stopCurrentAudio();
    pendingBookPageRef.current = getBookPageForScene(Math.max(sceneIndex - 1, 0));
    setIsFlipping(true);
    flipBookRef.current?.pageFlip().flipPrev("bottom");
  };

  const goNextPage = () => {
    stopCurrentAudio();
    if (isLastBookScene) {
      setIsFlipping(false);
      pendingBookPageRef.current = null;
      setSceneIndex(FINAL_SCENE_INDEX);
      return;
    }
    pendingBookPageRef.current = getBookPageForScene(sceneIndex + 1);
    setIsFlipping(true);
    flipBookRef.current?.pageFlip().flipNext("bottom");
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (canFinishCurrentPage) {
      finishCurrentPage();
      return;
    }
    if (isFlipping) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX < rect.left + rect.width / 2;

    if (isLeftHalf && sceneIndex > 0) {
      goPrevPage();
      return;
    }

    if (!isLeftHalf && canTurnPage) {
      goNextPage();
    }
  };

  const handleFlip = (event: { data: number }) => {
    const intendedPage = pendingBookPageRef.current;
    const normalizedPage = intendedPage ?? event.data - (event.data % 2);
    pendingBookPageRef.current = null;

    if (normalizedPage !== event.data) {
      window.requestAnimationFrame(() => {
        flipBookRef.current?.pageFlip().turnToPage(normalizedPage);
      });
    }

    const nextSceneIndex = Math.min(Math.floor(normalizedPage / 2), LAST_BOOK_SCENE_INDEX);
    setSceneIndex(nextSceneIndex);
    setIsFlipping(false);
  };

  return (
    <section className={styles.root}>
      {!isLast ? (
        <div className={styles.bookShell}>
          <div className={styles.storyControls}>
            <div className={styles.progressDots} aria-label={`Scene ${sceneIndex + 1} of ${STORY_SCENES.length}`}>
              {STORY_SCENES.map((_, index) => (
                <span
                  key={index}
                  className={`${styles.progressDot} ${index === sceneIndex ? styles.progressDotActive : ""}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <button type="button" className={styles.skipBtn} onClick={skipToFinalScene}>
              Skip
            </button>
          </div>

          <div className={styles.bookPageSpread}>
            <div className={styles.clickOverlay} onClick={handleOverlayClick} aria-hidden="true" />
            <HTMLFlipBook
              ref={flipBookRef}
              className={styles.flipBook}
              style={{}}
              width={640}
              height={710}
              minWidth={300}
              maxWidth={720}
              minHeight={360}
              maxHeight={820}
              size="stretch"
              startPage={0}
              drawShadow
              flippingTime={950}
              usePortrait={false}
              startZIndex={2}
              autoSize
              maxShadowOpacity={0.46}
              showCover={false}
              mobileScrollSupport
              clickEventForward
              useMouseEvents={false}
              swipeDistance={24}
              showPageCorners
              disableFlipByClick
              renderOnlyPageLengthChange={false}
              onFlip={handleFlip}
              onChangeState={(event: { data: string }) => {
                if (event.data === "flipping") setIsFlipping(true);
                if (event.data === "read") setIsFlipping(false);
              }}
            >
              {BOOK_SCENES.flatMap((item, index) => {
                const text = item.text
                  .split(/(?<=[.!?])\s+/)
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .join("\n");
                const textToShow = index === sceneIndex ? typedText : text;

                return [
                  <BookPage key={`${item.title}-image`} className={`${styles.flipPage} ${styles.leftPage}`}>
                    <img src={item.image} alt={item.title} className={styles.image} />
                  </BookPage>,
                  <BookPage key={`${item.title}-text`} className={`${styles.flipPage} ${styles.rightPage}`}>
                    <span className={styles.sceneKicker}>{item.title}</span>
                    <div className={styles.textViewport}>
                      <p className={styles.captionTextTyped}>{textToShow}</p>
                    </div>
                    {index === sceneIndex && (
                      <span className={`${styles.pageTurnCue} ${canTurnPage ? styles.pageTurnCueReady : ""}`} aria-hidden="true">
                        <span className={styles.pageTurnLine} />
                        <span className={styles.pageTurnArrow}>→</span>
                      </span>
                    )}
                  </BookPage>,
                ];
              })}
            </HTMLFlipBook>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.finalStage}>
            <div className={styles.finalImageWrap} onClick={openChapterPicker}>
              <img src={scene.image} alt={scene.title} className={styles.finalImage} />
              <div className={styles.finalCinematicOverlay} aria-hidden="true" />
              <button
                type="button"
                className={styles.openPickerBtn}
                onClick={(event) => {
                  event.stopPropagation();
                  openChapterPicker();
                }}
              >
                Choose destination
              </button>

              {chapterPickerOpen && (
                <div
                  className={styles.chapterPickerBackdrop}
                  onClick={(event) => {
                    event.stopPropagation();
                    setChapterPickerOpen(false);
                  }}
                  role="presentation"
                >
                  <div
                    className={styles.portalPanel}
                    aria-label="Choose a chapter"
                    role="dialog"
                    aria-modal="true"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <p className={styles.portalKicker}>Time machine calibrated</p>
                    <h2 className={styles.portalTitle}>Choose the case to enter.</h2>
                    <div className={styles.portalGrid}>
                      {PORTALS.map((portal) => (
                        <button
                          key={portal.id}
                          type="button"
                          className={`${styles.portalCard} ${styles[`portalCard_${portal.tone}`]}`}
                          onClick={() => enterPortal(portal.id)}
                        >
                          <span className={styles.portalNum}>Chapter {portal.num}</span>
                          <span className={styles.portalName}>{portal.title}</span>
                          <span className={styles.portalBody}>{portal.body}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
