import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./NarrativeBox.module.css";

interface NarrativeBoxProps {
  text: string;
  portraitSrc: string;
  onAdvance?: () => void;
}

const CHAR_SPEED = 25;

export default function NarrativeBox({ text, portraitSrc, onAdvance }: NarrativeBoxProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const complete = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDisplayedLength(text.length);
    setIsComplete(true);
  }, [text.length]);

  useEffect(() => {
    setDisplayedLength(0);
    setIsComplete(false);

    if (!text.length) {
      setIsComplete(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + 1;
        if (next >= text.length) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsComplete(true);
          return text.length;
        }
        return next;
      });
    }, CHAR_SPEED);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text]);

  const handleClick = () => {
    if (!isComplete) {
      complete();
    } else {
      onAdvance?.();
    }
  };

  const handleAdvanceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdvance?.();
  };

  return (
    <div className={styles.chatbox} onClick={handleClick} role="region" aria-label="Narrative">
      <div className={styles.namePlate}>Detective</div>
      <div className={styles.chatboxInner}>
        <div className={styles.portraitFrame} aria-hidden="true">
          <img src={portraitSrc} alt="" className={styles.portrait} />
        </div>
        <p className={styles.chatboxText}>
          {text.slice(0, displayedLength)}
          {!isComplete && <span className={styles.cursor} aria-hidden="true" />}
        </p>
        {isComplete && (
          <button
            type="button"
            className={styles.advanceBtn}
            onClick={handleAdvanceClick}
            aria-label="Advance"
          >
            ▼
          </button>
        )}
      </div>
    </div>
  );
}
