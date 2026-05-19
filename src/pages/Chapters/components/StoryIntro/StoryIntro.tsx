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
const BOOK_PAGE_ASPECT = 710 / 640;
const MIN_PAGE_WIDTH = 140;
const MAX_PAGE_WIDTH = 640;
const COMPACT_STORY_QUERY = "(max-width: 720px)";
const getBookPageForScene = (index: number) => index * 2;

export default function StoryIntro({ onStart, onSelectChapter }: StoryIntroProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);
  const [isCompactStory, setIsCompactStory] = useState(() => (
    typeof window === "undefined" ? false : window.matchMedia(COMPACT_STORY_QUERY).matches
  ));
  const [bookPageSize, setBookPageSize] = useState({ width: MAX_PAGE_WIDTH, height: Math.round(MAX_PAGE_WIDTH * BOOK_PAGE_ASPECT) });
  const bookSpreadRef = useRef<HTMLDivElement | null>(null);
  const flipBookRef = useRef<FlipBookHandle | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioStartTokenRef = useRef(0);
  const ignoreBookEventsRef = useRef(false);
  const typewriterTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const pendingBookPageRef = useRef<number | null>(null);
  const scene = STORY_SCENES[sceneIndex];
  const isLast = sceneIndex === FINAL_SCENE_INDEX;
  const isLastBookScene = sceneIndex === LAST_BOOK_SCENE_INDEX;

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_STORY_QUERY);
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsCompactStory(event.matches);
      setIsFlipping(false);
      pendingBookPageRef.current = null;
    };

    setIsCompactStory(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    if (isCompactStory) return;

    const spread = bookSpreadRef.current;
    if (!spread) return;

    const updateBookSize = () => {
      const spreadWidth = spread.clientWidth;
      const nextWidth = Math.max(MIN_PAGE_WIDTH, Math.min(MAX_PAGE_WIDTH, Math.floor(spreadWidth / 2)));
      const nextHeight = Math.round(nextWidth * BOOK_PAGE_ASPECT);
      setBookPageSize((current) => (
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight }
      ));
    };

    updateBookSize();

    const resizeObserver = new ResizeObserver(updateBookSize);
    resizeObserver.observe(spread);
    window.addEventListener("resize", updateBookSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBookSize);
    };
  }, [isCompactStory]);

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
    ignoreBookEventsRef.current = true;
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
    ignoreBookEventsRef.current = false;
    stopCurrentAudio();
    pendingBookPageRef.current = getBookPageForScene(Math.max(sceneIndex - 1, 0));
    setIsFlipping(true);
    flipBookRef.current?.pageFlip().flipPrev("bottom");
  };

  const goNextPage = () => {
    ignoreBookEventsRef.current = false;
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

  const goPrevScene = () => {
    ignoreBookEventsRef.current = false;
    stopCurrentAudio();
    pendingBookPageRef.current = null;
    setIsFlipping(false);
    setSceneIndex((current) => Math.max(current - 1, 0));
  };

  const goNextScene = () => {
    ignoreBookEventsRef.current = false;
    stopCurrentAudio();
    pendingBookPageRef.current = null;
    setIsFlipping(false);
    setSceneIndex((current) => (
      current >= LAST_BOOK_SCENE_INDEX ? FINAL_SCENE_INDEX : current + 1
    ));
  };

  const handleCompactStoryClick = () => {
    if (canFinishCurrentPage) {
      finishCurrentPage();
      return;
    }

    if (canTurnPage) {
      goNextScene();
    }
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
    if (ignoreBookEventsRef.current) return;

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

          {isCompactStory ? (
            <div className={styles.compactStory} onClick={handleCompactStoryClick} role="presentation">
              <div className={styles.compactImagePanel}>
                <img src={scene.image} alt={scene.title} className={styles.compactImage} />
              </div>
              <div className={styles.compactTextPanel}>
                <span className={styles.sceneKicker}>{scene.title}</span>
                <p className={styles.captionTextTyped}>{typedText}</p>
              </div>
              <div className={styles.compactNav} aria-label="Story navigation">
                <button
                  type="button"
                  className={styles.compactNavBtn}
                  onClick={(event) => {
                    event.stopPropagation();
                    goPrevScene();
                  }}
                  disabled={sceneIndex === 0}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={styles.compactNavBtn}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (canFinishCurrentPage) {
                      finishCurrentPage();
                      return;
                    }
                    goNextScene();
                  }}
                  disabled={!canFinishCurrentPage && !canTurnPage}
                >
                  {canFinishCurrentPage ? "Finish" : isLastBookScene ? "Continue" : "Next"}
                </button>
              </div>
            </div>
          ) : (
          <div className={styles.bookPageSpread} ref={bookSpreadRef}>
            <div className={styles.clickOverlay} onClick={handleOverlayClick} aria-hidden="true" />
            <HTMLFlipBook
              key={`${bookPageSize.width}-${bookPageSize.height}`}
              ref={flipBookRef}
              className={styles.flipBook}
              style={{}}
              width={bookPageSize.width}
              height={bookPageSize.height}
              minWidth={MIN_PAGE_WIDTH}
              maxWidth={bookPageSize.width}
              minHeight={Math.round(MIN_PAGE_WIDTH * BOOK_PAGE_ASPECT)}
              maxHeight={bookPageSize.height}
              size="stretch"
              startPage={getBookPageForScene(sceneIndex)}
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
                if (ignoreBookEventsRef.current) return;
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
          )}
        </div>
      ) : (
        <>
          <div className={styles.finalStage}>
            <div className={styles.finalImageWrap}>
              <img src={scene.image} alt={scene.title} className={styles.finalImage} />
              <div className={styles.finalCinematicOverlay} aria-hidden="true" />
              <button
                type="button"
                className={styles.openPickerBtn}
                disabled={chapterPickerOpen}
                aria-expanded={chapterPickerOpen}
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
                  onClick={(event) => event.stopPropagation()}
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
