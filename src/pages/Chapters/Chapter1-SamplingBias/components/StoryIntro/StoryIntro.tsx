import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import HTMLFlipBook from "react-pageflip";
import styles from "./StoryIntro.module.css";
import { STORY_SCENES } from "./storyIntroScenes";

type StoryIntroProps = {
  onStart: () => void;
};

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

export default function StoryIntro({ onStart }: StoryIntroProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const flipBookRef = useRef<FlipBookHandle | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioStartTokenRef = useRef(0);
  const typewriterTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const scene = STORY_SCENES[sceneIndex];
  const isLast = sceneIndex === STORY_SCENES.length - 1;

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
    stopCurrentAudio();
    flipBookRef.current?.pageFlip().turnToPage((STORY_SCENES.length - 1) * 2);
    setSceneIndex(STORY_SCENES.length - 1);
  };

  const startChapter = () => {
    stopCurrentAudio();
    onStart();
  };

  const goPrevPage = () => {
    stopCurrentAudio();
    setIsFlipping(true);
    flipBookRef.current?.pageFlip().flipPrev("bottom");
  };

  const goNextPage = () => {
    stopCurrentAudio();
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
    const nextSceneIndex = Math.min(Math.floor(event.data / 2), STORY_SCENES.length - 1);
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
              width={560}
              height={620}
              minWidth={300}
              maxWidth={620}
              minHeight={360}
              maxHeight={720}
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
              {STORY_SCENES.flatMap((item, index) => {
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
            <div className={styles.finalImageWrap}>
              <img src={scene.image} alt={scene.title} className={styles.finalImage} />
              <div className={styles.finalCinematicOverlay} aria-hidden="true" />
              <button type="button" className={styles.startBtn} onClick={startChapter}>
                Travel Back in Time
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
