import type { CSSProperties } from "react";
import styles from "./Tutorial.module.css";

type TutorialPopoverProps = {
  open: boolean;
  title: string;
  body: string;
  stepIndex: number;
  totalSteps: number;
  style: CSSProperties;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
  titleId?: string;
  popoverRef?: (node: HTMLElement | null) => void;
};

export default function TutorialPopover({
  open,
  title,
  body,
  stepIndex,
  totalSteps,
  style,
  onSkip,
  onBack,
  onNext,
  titleId,
  popoverRef,
}: TutorialPopoverProps) {
  if (!open) return null;

  return (
    <div ref={popoverRef} className={styles.popover} style={style} role="dialog" aria-labelledby={titleId}>
      <p className={styles.eyebrow}>
        Step {stepIndex + 1} of {totalSteps}
      </p>
      <h3 id={titleId} className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
      <div className={styles.progress} aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={i === stepIndex ? styles.progressDotActive : styles.progressDot}
          />
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.ghostBtn} onClick={onSkip}>
          Skip
        </button>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={onBack}
          disabled={stepIndex === 0}
        >
          Back
        </button>
        <button type="button" className={styles.primaryBtn} onClick={onNext}>
          {stepIndex === totalSteps - 1 ? "Done" : "Next"}
        </button>
      </div>
    </div>
  );
}
