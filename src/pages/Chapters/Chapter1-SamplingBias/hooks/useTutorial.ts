import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "../components/Tutorial/Tutorial.module.css";

export type Placement = "top" | "bottom" | "left" | "right" | "auto";

type ConcretePlacement = Exclude<Placement, "auto">;

export type TutorialStep<T extends string> = {
  target: T;
  title: string;
  body: string;
  placement?: Placement;
  offset?: { x?: number; y?: number };
};


type UseTutorialOptions = {
  enabled: boolean;
  onOpenChange?: (open: boolean) => void;
  onDismiss?: () => void;
};

export type TutorialDebugInfo = {
  requested: Placement;
  chosen: ConcretePlacement;
  target: { top: number; left: number; right: number; bottom: number; width: number; height: number };
  targetDescriptor: string;
  popover: { top: number; left: number; width: number; height: number };
  viewport: { width: number; height: number };
  spacePx: Record<ConcretePlacement, number>;
  fits: Record<ConcretePlacement, boolean>;
  offset: { x: number; y: number };
  overflow: Record<ConcretePlacement, number>;
};

export type TutorialController<T extends string> = {
  open: boolean;
  stepIndex: number;
  step: TutorialStep<T> | undefined;
  totalSteps: number;
  popoverStyle: CSSProperties;
  registerPopover: (el: HTMLElement | null) => void;
  getTargetClass: (target: T, baseClassName: string) => string;
  restart: () => void;
  goNext: () => void;
  goPrev: () => void;
  close: () => void;
  debugInfo: TutorialDebugInfo | null;
};

const TARGET_GAP = 16;
let tutorialInstanceCounter = 0;

const BASE_POPOVER_STYLE: CSSProperties = {
  width: "min(440px, calc(100vw - 32px))",
  maxWidth: "calc(100vw - 32px)",
  maxHeight: "calc(100vh - 32px)",
  overflowY: "auto",
  boxSizing: "border-box",
  pointerEvents: "auto",
};

const HIDDEN_POPOVER_STYLE: CSSProperties = {
  ...BASE_POPOVER_STYLE,
  top: 0,
  left: 0,
  right: "auto",
  visibility: "hidden",
};

type Rect = { top: number; left: number; right: number; bottom: number; width: number; height: number };

function placeOn(side: ConcretePlacement, t: Rect, pw: number, ph: number): { top: number; left: number } {
  switch (side) {
    case "bottom":
      return { top: t.bottom + TARGET_GAP, left: t.left + t.width / 2 - pw / 2 };
    case "top":
      return { top: t.top - TARGET_GAP - ph, left: t.left + t.width / 2 - pw / 2 };
    case "right":
      return { top: t.top + t.height / 2 - ph / 2, left: t.right + TARGET_GAP };
    case "left":
      return { top: t.top + t.height / 2 - ph / 2, left: t.left - TARGET_GAP - pw };
  }
}

function computePopoverStyle(
  target: HTMLElement,
  popover: HTMLElement,
  requested: Placement | undefined,
  offset: { x?: number; y?: number } | undefined,
): { style: CSSProperties; debug: TutorialDebugInfo } {
  const r = target.getBoundingClientRect();
  const t: Rect = {
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  };
  const pw = popover.offsetWidth;
  const ph = popover.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const space: Record<ConcretePlacement, number> = {
    top: t.top,
    bottom: vh - t.bottom,
    left: t.left,
    right: vw - t.right,
  };
  const fits: Record<ConcretePlacement, boolean> = {
    top: space.top >= ph + TARGET_GAP,
    bottom: space.bottom >= ph + TARGET_GAP,
    left: space.left >= pw + TARGET_GAP,
    right: space.right >= pw + TARGET_GAP,
  };
  const side = (Object.keys(space) as ConcretePlacement[]).reduce((best, s) =>
    space[s] > space[best] ? s : best,
  );
  const chosenSide = requested && requested !== "auto" ? requested : side;

  const { top: rawTop, left: rawLeft } = placeOn(chosenSide, t, pw, ph);

  const top = rawTop + (offset?.y ?? 0);
  const left = rawLeft + (offset?.x ?? 0);

  const overflow: Record<ConcretePlacement, number> = {
    top: Math.max(0, -top),
    bottom: Math.max(0, top + ph - vh),
    left: Math.max(0, -left),
    right: Math.max(0, left + pw - vw),
  };

  const tagName = target.tagName.toLowerCase();
  const cls = (target.className || "").toString().split(/\s+/).filter(Boolean).slice(0, 4).join(".");
  const textPreview = (target.textContent || "").trim().slice(0, 40).replace(/\s+/g, " ");
  const targetDescriptor = `<${tagName}${cls ? "." + cls : ""}> "${textPreview}${textPreview.length === 40 ? "…" : ""}"`;

  const debug: TutorialDebugInfo = {
    requested: requested ?? "auto",
    chosen: chosenSide,
    target: { top: t.top, left: t.left, right: t.right, bottom: t.bottom, width: t.width, height: t.height },
    targetDescriptor,
    popover: { top, left, width: pw, height: ph },
    viewport: { width: vw, height: vh },
    spacePx: space,
    fits,
    offset: { x: offset?.x ?? 0, y: offset?.y ?? 0 },
    overflow,
  };

  // eslint-disable-next-line no-console
  console.debug("[useTutorial] placement", debug);

  const style: CSSProperties = {
    ...BASE_POPOVER_STYLE,
    top,
    left,
    right: "auto",
    visibility: "visible",
  };

  return { style, debug };
}

export function useTutorial<T extends string>(
  steps: TutorialStep<T>[],
  { enabled, onOpenChange, onDismiss }: UseTutorialOptions,
): TutorialController<T> {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [manuallyStarted, setManuallyStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>(HIDDEN_POPOVER_STYLE);
  const [debugInfo, setDebugInfo] = useState<TutorialDebugInfo | null>(null);

  const popoverRef = useRef<HTMLElement | null>(null);
  const activeTargetClassRef = useRef<string | null>(null);
  const [popoverNode, setPopoverNode] = useState<HTMLElement | null>(null);

  if (!activeTargetClassRef.current) {
    tutorialInstanceCounter += 1;
    activeTargetClassRef.current = `tutorialActiveTarget-${tutorialInstanceCounter}`;
  }

  const step = steps[stepIndex];
  const stepTarget = step?.target;
  const placement = step?.placement;
  const offsetX = step?.offset?.x;
  const offsetY = step?.offset?.y;

  const registerPopover = useCallback((el: HTMLElement | null) => {
    popoverRef.current = el;
    setPopoverNode(el);
  }, []);

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

  useLayoutEffect(() => {
    if (!open || !step || !popoverNode) {
      setPopoverStyle(HIDDEN_POPOVER_STYLE);
      setDebugInfo(null);
      return;
    }
    const activeTargetClass = activeTargetClassRef.current;

    const update = () => {
      const target = document.querySelector<HTMLElement>(`.${activeTargetClass}`);
      if (!target || !popoverRef.current) {
        setPopoverStyle(HIDDEN_POPOVER_STYLE);
        setDebugInfo(null);
        return;
      }
      const { style, debug } = computePopoverStyle(
        target,
        popoverRef.current,
        placement,
        offsetX !== undefined || offsetY !== undefined ? { x: offsetX, y: offsetY } : undefined,
      );
      setPopoverStyle(style);
      setDebugInfo(debug);
    };

    const targetEl = document.querySelector<HTMLElement>(`.${activeTargetClass}`);
    targetEl?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    update();

    // Track the target every frame while the tutorial is open so we always
    // reflect the latest position (entry animations, smooth scrolls, layout
    // shifts, etc.).
    let rafId = window.requestAnimationFrame(function tick() {
      update();
      rafId = window.requestAnimationFrame(tick);
    });

    const ro = new ResizeObserver(update);
    ro.observe(popoverNode);
    if (targetEl) ro.observe(targetEl);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, step, stepIndex, stepTarget, placement, offsetX, offsetY, popoverNode]);

  const getTargetClass = (target: T, baseClassName: string) => {
    const isActive = open && stepTarget === target;
    const isDimmed = open && !isActive;
    return `${baseClassName} ${styles.target} ${isActive ? `${styles.targetActive} ${activeTargetClassRef.current}` : ""} ${isDimmed ? styles.targetDimmed : ""}`;
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
    popoverStyle,
    registerPopover,
    getTargetClass,
    restart,
    goNext,
    goPrev,
    close,
    debugInfo,
  };
}
