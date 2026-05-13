import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import styles from "../components/Tutorial/Tutorial.module.css";

export type TutorialStep<T extends string> = {
  target: T;
  title: string;
  body: string;
};

type UseTutorialOptions = {
  enabled: boolean;
  onOpenChange?: (open: boolean) => void;
  onDismiss?: () => void;
};

export type TutorialController<T extends string> = {
  open: boolean;
  stepIndex: number;
  step: TutorialStep<T> | undefined;
  totalSteps: number;
  popoverStyle: CSSProperties;
  getTargetClass: (target: T, baseClassName: string) => string;
  restart: () => void;
  goNext: () => void;
  goPrev: () => void;
  close: () => void;
};

const FIXED_POPOVER_STYLE: CSSProperties = {
  width: "min(440px, calc(100vw - 32px))",
  maxWidth: "calc(100vw - 32px)",
  maxHeight: "calc(100vh - 32px)",
  overflowY: "auto",
  boxSizing: "border-box",
  top: 88,
  right: 24,
  left: "auto",
  visibility: "visible",
  pointerEvents: "auto",
};

export function useTutorial<T extends string>(
  steps: TutorialStep<T>[],
  { enabled, onOpenChange, onDismiss }: UseTutorialOptions,
): TutorialController<T> {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [manuallyStarted, setManuallyStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const step = steps[stepIndex];
  const stepTarget = step?.target;

  useEffect(() => {
    if ((enabled && !dismissed) || manuallyStarted) {
      setOpen(true);
      return;
    }
    setOpen(false);
  }, [enabled, dismissed, manuallyStarted]);

  useEffect(() => {
    onOpenChange?.(open);
    return () => onOpenChange?.(false);
  }, [open, onOpenChange]);

  const getTargetClass = (target: T, baseClassName: string) => {
    const isActive = open && stepTarget === target;
    const isDimmed = open && !isActive;
    return `${baseClassName} ${styles.target} ${isActive ? styles.targetActive : ""} ${isDimmed ? styles.targetDimmed : ""}`;
  };

  const close = () => {
    setManuallyStarted(false);
    setOpen(false);
    setDismissed(true);
    onDismiss?.();
  };

  const restart = () => {
    if (!steps.length) return;
    setStepIndex(0);
    setManuallyStarted(true);
    setDismissed(false);
    setOpen(true);
  };

  const goPrev = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };
  const goNext = () => {
    if (stepIndex >= steps.length - 1) {
      close();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  return {
    open,
    stepIndex,
    step,
    totalSteps: steps.length,
    popoverStyle: FIXED_POPOVER_STYLE,
    getTargetClass,
    restart,
    goNext,
    goPrev,
    close,
  };
}
