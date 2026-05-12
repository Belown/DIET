import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "../components/Tutorial/Tutorial.module.css";

export type TutorialStep<T extends string> = {
  target: T;
  title: string;
  body: string;
  offset?: { x: number; y: number };
};

type UseTutorialOptions = {
  enabled: boolean;
  onOpenChange?: (open: boolean) => void;
  popoverWidth?: number;
};

export type TutorialController<T extends string> = {
  open: boolean;
  stepIndex: number;
  step: TutorialStep<T> | undefined;
  totalSteps: number;
  popoverStyle: CSSProperties;
  registerTarget: (target: T) => (node: HTMLElement | null) => void;
  getTargetClass: (target: T, baseClassName: string) => string;
  goNext: () => void;
  goPrev: () => void;
  close: () => void;
};

export function useTutorial<T extends string>(
  steps: TutorialStep<T>[],
  { enabled, onOpenChange, popoverWidth = 440 }: UseTutorialOptions,
): TutorialController<T> {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});
  const targets = useRef<Record<string, HTMLElement | null>>({});

  const step = steps[stepIndex];
  const stepTarget = step?.target;

  const updatePosition = useCallback(() => {
    if (!step) return;
    const target = targets.current[step.target];
    if (!target) {
      setPopoverStyle({});
      return;
    }
    const rect = target.getBoundingClientRect();
    const offset = step.offset ?? { x: 0, y: 0 };
    setPopoverStyle({
      width: popoverWidth,
      left: rect.left + rect.width / 2 + offset.x,
      top: rect.top + rect.height / 2 + offset.y,
    });
  }, [step, popoverWidth]);

  useEffect(() => {
    if (enabled && !dismissed) {
      setOpen(true);
      return;
    }
    setOpen(false);
  }, [enabled, dismissed]);

  useEffect(() => {
    onOpenChange?.(open);
    return () => onOpenChange?.(false);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open || !stepTarget) return;
    const target = targets.current[stepTarget];
    window.requestAnimationFrame(() => {
      target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      updatePosition();
    });
    const timer = window.setTimeout(updatePosition, 420);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [stepTarget, open, updatePosition]);

  const registerTarget = (target: T) => (node: HTMLElement | null) => {
    targets.current[target] = node;
  };

  const getTargetClass = (target: T, baseClassName: string) => {
    const isActive = open && stepTarget === target;
    const isDimmed = open && !isActive;
    return `${baseClassName} ${styles.target} ${isActive ? styles.targetActive : ""} ${isDimmed ? styles.targetDimmed : ""}`;
  };

  const close = () => {
    setOpen(false);
    setDismissed(true);
  };

  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));
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
    popoverStyle,
    registerTarget,
    getTargetClass,
    goNext,
    goPrev,
    close,
  };
}
