import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./StoryIntro.module.css";
import scene1 from "../../../../../assets/image/Scene1.png";
import scene2 from "../../../../../assets/image/Scene2.png";
import scene3 from "../../../../../assets/image/Scene3.png";
import scene4 from "../../../../../assets/image/Scene4.png";
import scene5 from "../../../../../assets/image/Scene5.png";
import scene6 from "../../../../../assets/image/Scene6.png";
import scene7 from "../../../../../assets/image/Scene7.png";
import scene8 from "../../../../../assets/image/Scene8.png";
import scene9 from "../../../../../assets/image/Scene9.png";
import scene1Audio from "../../../../../assets/audio/Scene1.mp3";
import scene2Audio from "../../../../../assets/audio/Scene2.mp3";
import scene3Audio from "../../../../../assets/audio/Scene3.mp3";
import scene4Audio from "../../../../../assets/audio/Scene4.mp3";
import scene5Audio from "../../../../../assets/audio/Scene5.mp3";
import scene6Audio from "../../../../../assets/audio/Scene6.mp3";
import scene7Audio from "../../../../../assets/audio/Scene7.mp3";
import scene8Audio from "../../../../../assets/audio/Scene8.mp3";

type StoryIntroProps = {
  onStart: () => void;
};

const SCENES = [
  {
    image: scene1,
    title: "Scene 1",
    text: "In the future city of Nova, humanity has handed its hardest choices to AI. It decides who receives a loan, who gets a job, who enters school, and who is found guilty. People believe it never gets tired, never takes sides, and is never influenced by emotion. In this city, AI is known as 'the fairest judge'.",
  },
  {
    image: scene2,
    title: "Scene 2",
    text: "In one quiet corner of the city, a private detective lives a peaceful life. By his side are only a loyal dog and a young apprentice. They do not have a luxurious office or world-shaking cases. But in an age ruled by machines, this small home still holds a little warmth.",
  },
  {
    image: scene3,
    title: "Scene 3",
    text: "Until one ordinary morning, the doorbell rings. The sound is short and cold, as if fate itself is knocking. Police officers are standing outside. They offer little explanation and say only one thing: the apprentice has been accused of helping steal confidential government documents.",
  },
  {
    image: scene4,
    title: "Scene 4",
    text: "The apprentice says he knows nothing. A stranger simply gave him a little money and asked him to slip a small device into a businessman's pocket. He thought it was just a strange errand, a harmless little task. But he did not know he had already been pulled into a much larger conspiracy.",
  },
  {
    image: scene5,
    title: "Scene 5",
    text: "The AI does not see his panic. It does not see that he was used, nor the truth hidden behind the incident. It sees only data: his background, his neighborhood, and people from similar past cases. Then the system delivers a cold conclusion: High risk.",
  },
  {
    image: scene6,
    title: "Scene 6",
    text: "In court, the detective desperately tries to explain. He presents evidence, tells the story, and tries to make people see what happened. But before the judge, a human voice seems too slow, too fragile. The AI's judgment is clean, fast, and certain. At last, the gavel falls. Not because the truth has been seen, but because the machine has made its decision.",
  },
  {
    image: scene7,
    title: "Scene 7",
    text: "The days that follow become long and silent. The case files pile higher on the desk, and the clues on the wall grow more tangled. Every page points to doubt. Every clue proves that some truth is still unseen. But the city has already moved on. Only the detective remains trapped in that day, unable to move forward.",
  },
  {
    image: scene8,
    title: "Scene 8",
    text: "Just as he is about to give up, a stranger appears at the door. He carries a machine that should not exist, and a hope that sounds almost impossible. 'I cannot change the verdict now,' he says. 'But I can send you back to before it all happened.' Back to before the AI was deployed. Back to before bias became a verdict. Back to the moment when the future can still be changed.",
  },
  {
    image: scene9,
    title: "Scene 9",
    text: "",
  },
] as const;

const SCENE_AUDIO_BY_INDEX: Partial<Record<number, string>> = {
  0: scene1Audio,
  1: scene2Audio,
  2: scene3Audio,
  3: scene4Audio,
  4: scene5Audio,
  5: scene6Audio,
  6: scene7Audio,
  7: scene8Audio,
};

export default function StoryIntro({ onStart }: StoryIntroProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [turning, setTurning] = useState(false);
  const [bookPageHeight, setBookPageHeight] = useState<number | null>(null);
  const leftPageRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const turnTimeoutRef = useRef<number | null>(null);
  const audioStartTokenRef = useRef(0);
  const scene = SCENES[sceneIndex];
  const isLast = sceneIndex === SCENES.length - 1;

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
        i += 1;
        setTypedText(formattedText.slice(0, i));
        if (i >= formattedText.length && timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
      }, tickMs);
    };

    const sceneAudioSrc = SCENE_AUDIO_BY_INDEX[sceneIndex];
    if (sceneAudioSrc) {
      const sceneAudio = new Audio(sceneAudioSrc);
      audioRef.current = sceneAudio;
      sceneAudio.preload = "auto";

      const startScene = (tickMs: number) => {
        if (startToken !== audioStartTokenRef.current) return;
        if (fallbackTimer !== null) {
          window.clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        startTypewriter(tickMs);
        void sceneAudio?.play().catch(() => {
          // Ignore autoplay blocks; typewriter still runs.
        });
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
      sceneAudio.load();
      fallbackTimer = window.setTimeout(() => startScene(18), 300);
    } else {
      startTypewriter(18);
    }

    return () => {
      if (timer !== null) window.clearInterval(timer);
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      stopCurrentAudio();
    };
  }, [formattedText, isLast, sceneIndex]);

  useEffect(() => {
    return () => {
      if (turnTimeoutRef.current !== null) {
        window.clearTimeout(turnTimeoutRef.current);
      }
      stopCurrentAudio();
    };
  }, []);

  useEffect(() => {
    if (isLast || !leftPageRef.current) return;
    const el = leftPageRef.current;
    const update = () => setBookPageHeight(Math.round(el.getBoundingClientRect().height));
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLast, sceneIndex]);

  const canTurnPage = !isLast && !turning && typedText.length >= formattedText.length;

  const skipToFinalScene = () => {
    if (turnTimeoutRef.current !== null) {
      window.clearTimeout(turnTimeoutRef.current);
      turnTimeoutRef.current = null;
    }
    setTurning(false);
    stopCurrentAudio();
    setSceneIndex(SCENES.length - 1);
  };

  const startChapter = () => {
    if (turnTimeoutRef.current !== null) {
      window.clearTimeout(turnTimeoutRef.current);
      turnTimeoutRef.current = null;
    }
    stopCurrentAudio();
    onStart();
  };

  const goNextPage = () => {
    if (!canTurnPage) return;
    stopCurrentAudio();
    setTurning(true);
    turnTimeoutRef.current = window.setTimeout(() => {
      setSceneIndex((v) => Math.min(SCENES.length - 1, v + 1));
      setTurning(false);
      turnTimeoutRef.current = null;
    }, 520);
  };

  return (
    <section className={styles.root}>
      {!isLast ? (
        <div className={styles.bookShell}>
          <button type="button" className={styles.skipBtn} onClick={skipToFinalScene}>
            Skip
          </button>

          <div className={styles.bookPageSpread}>
            <div className={styles.leftPage} ref={leftPageRef}>
              <img src={scene.image} alt={scene.title} className={styles.image} />
            </div>

            <button
              type="button"
              className={`${styles.rightPage} ${turning ? styles.rightPageTurning : ""}`}
              onClick={goNextPage}
              disabled={!canTurnPage}
              aria-label="Turn to next page"
              style={bookPageHeight ? { height: `${bookPageHeight}px` } : undefined}
            >
              <div className={styles.textViewport}>
                <p className={styles.captionTextGhost}>{formattedText}</p>
                <p className={styles.captionTextTyped}>{typedText}</p>
              </div>
              {canTurnPage && <span className={styles.sparkleHint} aria-hidden="true">✦</span>}
            </button>
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
