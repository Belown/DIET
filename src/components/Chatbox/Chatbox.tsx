import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import historyIcon from "../../assets/svgs/history-icon.svg";
import skipIcon from "../../assets/svgs/skip-icon.svg";
import InlineMarkup, { getInlineMarkupVisibleLength } from "../InlineMarkup/InlineMarkup";
import styles from "./Chatbox.module.css";

export interface ChatboxProps {
  text: string;
  portraitSrc: string;
  history?: DialogueHistoryItem[];
  onHistorySelect?: (index: number) => void;
  onAdvance?: () => void;
  onSkipToImportantInstruction?: () => void;
  onTextComplete?: () => void;
  autoCollapseOnTextComplete?: boolean;
  speakerName?: string;
  disableKeyboardAdvance?: boolean;
  disablePreviousNavigation?: boolean;
  forceOpen?: boolean;
  reopenSignal?: number;
}

export interface DialogueHistoryItem {
  text: string;
  current?: boolean;
  passageId?: string;
}

const CHAR_SPEED = 25;
const AUTO_COLLAPSE_DELAY_MS = 900;
const SHEET_HISTORY_MARKER_TEXT = "Read the sheet carefully. Then draw the best boundary you can.";

export default function Chatbox({
  text,
  portraitSrc,
  history = [],
  onHistorySelect,
  onAdvance,
  onSkipToImportantInstruction,
  onTextComplete,
  autoCollapseOnTextComplete = false,
  speakerName = "Detective",
  disableKeyboardAdvance = false,
  disablePreviousNavigation = false,
  forceOpen = false,
  reopenSignal = 0,
}: ChatboxProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openHistoryGroups, setOpenHistoryGroups] = useState<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasReportedCompleteRef = useRef(false);
  const wasAutoCollapsedRef = useRef(false);
  const historyGroupRefs = useRef<Record<string, HTMLElement | null>>({});
  const hasPastDialogue = history.some((item) => !item.current);
  const currentHistoryItem = history.find((item) => item.current);
  const currentHistoryGroupId = currentHistoryItem?.passageId ?? "dialogue";
  const visibleTextLength = useMemo(() => getInlineMarkupVisibleLength(text), [text]);

  const historyGroups = useMemo(() => {
    return history.reduce<Array<{ id: string; label: string; items: Array<DialogueHistoryItem & { index: number }> }>>(
      (groups, item, index) => {
        const id = item.passageId ?? "dialogue";
        const existingGroup = groups.find((group) => group.id === id);

        if (existingGroup) {
          existingGroup.items.push({ ...item, index });
          return groups;
        }

        groups.push({
          id,
          label: item.passageId ?? "Dialogue",
          items: [{ ...item, index }],
        });
        return groups;
      },
      []
    );
  }, [history]);

  const isHistoryGroupOpen = (id: string) => openHistoryGroups[id] ?? true;

  const toggleHistoryGroup = (id: string) => {
    setOpenHistoryGroups((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  useEffect(() => {
    if (!isHistoryOpen || !currentHistoryGroupId) return;

    setOpenHistoryGroups((prev) => {
      if (prev[currentHistoryGroupId] ?? true) return prev;
      return { ...prev, [currentHistoryGroupId]: true };
    });

    window.requestAnimationFrame(() => {
      historyGroupRefs.current[currentHistoryGroupId]?.scrollIntoView({ block: "start" });
    });
  }, [currentHistoryGroupId, isHistoryOpen]);

  const reportComplete = useCallback(() => {
    if (hasReportedCompleteRef.current) return;
    hasReportedCompleteRef.current = true;
    onTextComplete?.();
  }, [onTextComplete]);

  const clearCollapseTimer = useCallback(() => {
    if (!collapseTimerRef.current) return;
    clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = null;
  }, []);

  const collapse = useCallback((autoCollapsed: boolean) => {
    clearCollapseTimer();
    wasAutoCollapsedRef.current = autoCollapsed;
    setIsCollapsed(true);
  }, [clearCollapseTimer]);

  const complete = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDisplayedLength(visibleTextLength);
    setIsComplete(true);
    reportComplete();
  }, [reportComplete, visibleTextLength]);

  useEffect(() => {
    clearCollapseTimer();
    setDisplayedLength(0);
    setIsComplete(false);
    setIsHistoryOpen(false);
    if (wasAutoCollapsedRef.current || autoCollapseOnTextComplete) {
      wasAutoCollapsedRef.current = false;
      setIsCollapsed(false);
    }
    hasReportedCompleteRef.current = false;

    if (!visibleTextLength) {
      setIsComplete(true);
      reportComplete();
      return;
    }

    timerRef.current = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + 1;
        if (next >= visibleTextLength) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsComplete(true);
          reportComplete();
          return visibleTextLength;
        }
        return next;
      });
    }, CHAR_SPEED);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      clearCollapseTimer();
    };
  }, [autoCollapseOnTextComplete, clearCollapseTimer, reportComplete, text, visibleTextLength]);

  useEffect(() => {
    if (!forceOpen) return;
    clearCollapseTimer();
    wasAutoCollapsedRef.current = false;
    setIsCollapsed(false);
  }, [clearCollapseTimer, forceOpen, text]);

  useEffect(() => {
    if (!reopenSignal) return;
    clearCollapseTimer();
    wasAutoCollapsedRef.current = false;
    setIsCollapsed(false);
  }, [clearCollapseTimer, reopenSignal]);

  useEffect(() => {
    if (!autoCollapseOnTextComplete || !isComplete || isCollapsed || forceOpen || isHistoryOpen) return;

    collapseTimerRef.current = setTimeout(() => {
      collapse(true);
    }, AUTO_COLLAPSE_DELAY_MS);

    return clearCollapseTimer;
  }, [autoCollapseOnTextComplete, clearCollapseTimer, collapse, forceOpen, isCollapsed, isComplete, isHistoryOpen, text]);

  const handleClick = () => {
    if (isCollapsed) return;

    if (!isComplete) {
      complete();
      return;
    }

    if (autoCollapseOnTextComplete) {
      collapse(true);
    } else if (!onAdvance) {
      collapse(false);
    } else {
      onAdvance?.();
    }
  };

  const handleAdvanceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  const handleHistoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHistoryOpen((prev) => !prev);
  };

  const handleSkipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    complete();
    setIsHistoryOpen(false);
    clearCollapseTimer();
    wasAutoCollapsedRef.current = false;
    setIsCollapsed(false);
    onSkipToImportantInstruction?.();
  };

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    collapse(false);
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearCollapseTimer();
    wasAutoCollapsedRef.current = false;
    setIsCollapsed(false);
  };

  const handleHistorySelect = (index: number) => {
    setIsHistoryOpen(false);
    if (disablePreviousNavigation) return;
    if (!history[index]?.current) {
      onHistorySelect?.(index);
    }
  };

  const navigateToPreviousHistory = () => {
    if (disablePreviousNavigation) return;
    const currentIndex = history.findIndex((item) => item.current);
    if (currentIndex <= 0) return;

    onHistorySelect?.(currentIndex - 1);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!["ArrowRight", "ArrowLeft"].includes(event.code) || isCollapsed || isHistoryOpen || disableKeyboardAdvance) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName.toLowerCase();
        if (target.isContentEditable || ["button", "input", "select", "textarea"].includes(tagName)) {
          return;
        }
      }

      event.preventDefault();
      if (event.code === "ArrowRight") {
        handleClick();
      } else {
        navigateToPreviousHistory();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [complete, disableKeyboardAdvance, disablePreviousNavigation, history, isCollapsed, isComplete, isHistoryOpen, onAdvance, onHistorySelect]);

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
              {historyGroups.map((group) => {
                const isOpen = isHistoryGroupOpen(group.id);

                return (
                  <section
                    className={styles.historyGroup}
                    key={group.id}
                    ref={(element) => {
                      historyGroupRefs.current[group.id] = element;
                    }}
                  >
                    <button
                      type="button"
                      className={styles.historyGroupToggle}
                      onClick={() => toggleHistoryGroup(group.id)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.historyGroupIcon} aria-hidden="true">
                        {isOpen ? "-" : "+"}
                      </span>
                      <span className={styles.historyGroupLabel}>{group.label}</span>
                      <span className={styles.historyGroupCount}>{group.items.length}</span>
                    </button>

                    {isOpen && (
                      <div className={styles.historyGroupList}>
                        {group.items.map((item) => (
                          <button
                            type="button"
                            className={`${styles.historyLine}${item.current ? ` ${styles.historyLineCurrent}` : ""}`}
                            key={`${item.index}-${item.text.slice(0, 24)}`}
                            onClick={() => handleHistorySelect(item.index)}
                            disabled={item.current || disablePreviousNavigation}
                          >
                            <span className={styles.speaker}>{speakerName}</span>
                            <span className={styles.historyText}>
                              {item.text === SHEET_HISTORY_MARKER_TEXT && (
                                <span className={styles.historySheetMarker} aria-label="Sheet passage">
                                  📋
                                </span>
                              )}
                              <InlineMarkup text={item.text} />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div
        className={`${styles.chatbox} ${isCollapsed ? styles.chatboxCollapsed : ""}`}
        onClick={handleClick}
        role="region"
        aria-label={isCollapsed ? "Narrative collapsed" : "Narrative"}
      >
        <div className={styles.namePlate}>{speakerName}</div>
        <button type="button" className={styles.openChatboxBtn} onClick={handleOpenClick} aria-label="Open narrative">
          Open
        </button>
        <button type="button" className={styles.hideBtn} onClick={handleCollapseClick} aria-label="Hide narrative">
          Hide
        </button>
        <div className={styles.chatboxInner}>
          <div className={styles.portraitFrame} aria-hidden="true">
            <img src={portraitSrc} alt="" className={styles.portrait} />
          </div>
          <p className={styles.chatboxText}>
            <InlineMarkup text={text} maxVisibleChars={displayedLength} />
            {!isComplete && <span className={styles.cursor} aria-hidden="true" />}
          </p>
          {(hasPastDialogue || text.length > 0) && (
            <div className={styles.navControls}>
              {onSkipToImportantInstruction && (
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={handleSkipClick}
                  aria-label="Skip to next important instruction"
                  title="Skip to next important instruction"
                >
                  <img src={skipIcon} alt="" className={styles.controlIcon} aria-hidden="true" />
                </button>
              )}
              {hasPastDialogue && (
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={handleHistoryClick}
                  aria-label="Show dialogue history"
                  aria-expanded={isHistoryOpen}
                >
                  <img src={historyIcon} alt="" className={styles.controlIcon} aria-hidden="true" />
                </button>
              )}
              {text.length > 0 && (!isComplete || onAdvance) && (
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
