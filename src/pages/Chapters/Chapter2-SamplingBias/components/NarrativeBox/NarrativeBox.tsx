import { useState, useEffect, useRef, useCallback } from "react";
import historyIcon from "../../assets/history-icon.svg";
import styles from "./NarrativeBox.module.css";

interface NarrativeBoxProps {
  text: string;
  portraitSrc: string;
  history?: DialogueHistoryItem[];
  onHistorySelect?: (index: number) => void;
  onAdvance?: () => void;
}

export interface DialogueHistoryItem {
  text: string;
  current?: boolean;
}

const CHAR_SPEED = 25;

export default function NarrativeBox({
  text,
  portraitSrc,
  history = [],
  onHistorySelect,
  onAdvance,
}: NarrativeBoxProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPastDialogue = history.some((item) => !item.current);

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
    setIsHistoryOpen(false);

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

  const handleHistoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHistoryOpen((prev) => !prev);
  };

  const handleHistorySelect = (index: number) => {
    setIsHistoryOpen(false);
    if (!history[index]?.current) {
      onHistorySelect?.(index);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isHistoryOpen) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName.toLowerCase();
        if (target.isContentEditable || ["button", "input", "select", "textarea"].includes(tagName)) {
          return;
        }
      }

      event.preventDefault();
      handleClick();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [complete, isComplete, isHistoryOpen, onAdvance]);

  return (
    <>
      {isHistoryOpen && (
        <div className={styles.historyOverlay} onClick={() => setIsHistoryOpen(false)}>
          <div
            className={styles.historyDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialogue-history-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.historyHeader}>
              <h2 id="dialogue-history-title" className={styles.historyTitle}>
                Dialogue History
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsHistoryOpen(false)}
                aria-label="Close dialogue history"
              >
                x
              </button>
            </div>
            <div className={styles.historyTranscript}>
              {history.map((item, index) => (
                <button
                  type="button"
                  className={styles.historyLine}
                  key={`${index}-${item.text.slice(0, 24)}`}
                  onClick={() => handleHistorySelect(index)}
                  disabled={item.current}
                >
                  <span className={styles.speaker}>Detective</span>
                  <span className={styles.historyText}>{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
          {(hasPastDialogue || isComplete) && (
            <div className={styles.navControls}>
              {hasPastDialogue && (
                <button
                  type="button"
                  className={styles.historyBtn}
                  onClick={handleHistoryClick}
                  aria-label="Show dialogue history"
                  aria-expanded={isHistoryOpen}
                >
                  <img src={historyIcon} alt="" className={styles.historyIcon} aria-hidden="true" />
                </button>
              )}
              {isComplete && (
                <button type="button" className={styles.navBtn} onClick={handleAdvanceClick} aria-label="Advance">
                  {">"}
                </button>
              )}
            </div>
            )}
        </div>
      </div>
    </>
  );
}
