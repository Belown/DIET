import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "../components/Tutorial/Tutorial.module.css";

export type TutorialPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type TutorialStep<T extends string> = {
  target: T;
  title: string;
  body: string;
  placement?: TutorialPlacement;
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
  registerPopover: (node: HTMLElement | null) => void;
  getTargetClass: (target: T, baseClassName: string) => string;
  goNext: () => void;
  goPrev: () => void;
  close: () => void;
};

const GAP = 16;
const VIEWPORT_PAD = 16;

const opposite: Record<Exclude<TutorialPlacement, "auto">, Exclude<TutorialPlacement, "auto">> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export function useTutorial<T extends string>(
  steps: TutorialStep<T>[],
  { enabled, onOpenChange, popoverWidth = 440 }: UseTutorialOptions,
): TutorialController<T> {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const hiddenPopoverStyle = useMemo<CSSProperties>(
    () => ({
      width: popoverWidth,
      visibility: "hidden",
      pointerEvents: "none",
    }),
    [popoverWidth],
  );
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>(hiddenPopoverStyle);
  const targets = useRef<Record<string, HTMLElement | null>>({});
  const popoverEl = useRef<HTMLElement | null>(null);

  const step = steps[stepIndex];
  const stepTarget = step?.target;

  const updatePosition = useCallback(() => {
    if (!step) return;
    const target = targets.current[step.target];
    if (!target) {
      setPopoverStyle(hiddenPopoverStyle);
      return;
    }
    const rect = target.getBoundingClientRect();
    const popoverRect = popoverEl.current?.getBoundingClientRect();
    const popW = popoverRect?.width ?? popoverWidth;
    const popH = popoverRect?.height ?? 220;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const candidateFor = (p: Exclude<TutorialPlacement, "auto">) => {
      let left = 0;
      let top = 0;
      if (p === "top") {
        left = rect.left + rect.width / 2 - popW / 2;
        top = rect.top - popH - GAP;
      } else if (p === "bottom") {
        left = rect.left + rect.width / 2 - popW / 2;
        top = rect.bottom + GAP;
      } else if (p === "left") {
        left = rect.left - popW - GAP;
        top = rect.top + rect.height / 2 - popH / 2;
      } else {
        left = rect.right + GAP;
        top = rect.top + rect.height / 2 - popH / 2;
      }
      const overflow =
        Math.max(0, VIEWPORT_PAD - left) +
        Math.max(0, left + popW - (vw - VIEWPORT_PAD)) +
        Math.max(0, VIEWPORT_PAD - top) +
        Math.max(0, top + popH - (vh - VIEWPORT_PAD));
      return { left, top, overflow };
    };

    const allPlacements: Array<Exclude<TutorialPlacement, "auto">> = ["bottom", "top", "right", "left"];
    const requested = step.placement ?? "auto";
    const order: Array<Exclude<TutorialPlacement, "auto">> =
      requested === "auto"
        ? allPlacements
        : [requested, opposite[requested], ...allPlacements.filter((p) => p !== requested && p !== opposite[requested])];

    let chosen = order[0];
    let chosenC = candidateFor(chosen);
    for (const p of order.slice(1)) {
      if (chosenC.overflow === 0) break;
      const c = candidateFor(p);
      if (c.overflow < chosenC.overflow) {
        chosen = p;
        chosenC = c;
      }
    }

    const offset = step.offset ?? { x: 0, y: 0 };
    let left = chosenC.left + offset.x;
    let top = chosenC.top + offset.y;
    left = Math.min(Math.max(VIEWPORT_PAD, left), Math.max(VIEWPORT_PAD, vw - popW - VIEWPORT_PAD));
    top = Math.min(Math.max(VIEWPORT_PAD, top), Math.max(VIEWPORT_PAD, vh - popH - VIEWPORT_PAD));

    setPopoverStyle({ width: popoverWidth, left, top, visibility: "visible", pointerEvents: "auto" });
  }, [hiddenPopoverStyle, step, popoverWidth]);

  useEffect(() => {
    if (enabled && !dismissed) {
      setPopoverStyle(hiddenPopoverStyle);
      setOpen(true);
      return;
    }
    setOpen(false);
  }, [enabled, dismissed, hiddenPopoverStyle]);

  useEffect(() => {
    onOpenChange?.(open);
    return () => onOpenChange?.(false);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open || !stepTarget) return;
    setPopoverStyle(hiddenPopoverStyle);
    const target = targets.current[stepTarget];
    window.requestAnimationFrame(() => {
      target?.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
      updatePosition();
    });
    const timer = window.setTimeout(updatePosition, 420);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && popoverEl.current) {
      ro = new ResizeObserver(() => updatePosition());
      ro.observe(popoverEl.current);
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      ro?.disconnect();
    };
  }, [stepTarget, open, updatePosition, hiddenPopoverStyle]);

  const registerTarget = (target: T) => (node: HTMLElement | null) => {
    targets.current[target] = node;
  };

  const registerPopover = useCallback(
    (node: HTMLElement | null) => {
      popoverEl.current = node;
      if (node) updatePosition();
    },
    [updatePosition],
  );

  const getTargetClass = (target: T, baseClassName: string) => {
    const isActive = open && stepTarget === target;
    const isDimmed = open && !isActive;
    return `${baseClassName} ${styles.target} ${isActive ? styles.targetActive : ""} ${isDimmed ? styles.targetDimmed : ""}`;
  };

  const close = () => {
    setOpen(false);
    setDismissed(true);
  };

  const goPrev = () => {
    setPopoverStyle(hiddenPopoverStyle);
    setStepIndex((i) => Math.max(0, i - 1));
  };
  const goNext = () => {
    if (stepIndex >= steps.length - 1) {
      close();
      return;
    }
    setPopoverStyle(hiddenPopoverStyle);
    setStepIndex((i) => i + 1);
  };

  return {
    open,
    stepIndex,
    step,
    totalSteps: steps.length,
    popoverStyle,
    registerTarget,
    registerPopover,
    getTargetClass,
    goNext,
    goPrev,
    close,
  };
}
