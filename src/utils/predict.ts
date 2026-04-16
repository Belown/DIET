import type { CVSample } from "../data/dataset";
import type { BoundaryParams } from "../context/SimulatorContext";

export type PredResult = { id: number; hired: boolean };

/**
 * Phase 1: hire if experience >= slope1 * techScore + intercept1
 * Phase 2: hire if experience >= slope2 * softSkill + intercept2  (OR logic — second chance)
 *          OR   if softSkill  >= slope3 * techScore + intercept3  (tech × soft skill boundary)
 */
export function predictAll(
  samples: CVSample[],
  b1: BoundaryParams,
  b2: BoundaryParams,
  usePhase2: boolean,
  b3?: BoundaryParams,
): PredResult[] {
  return samples.map((s) => {
    const p1 = s.experience >= b1.slope * s.techScore + b1.intercept;
    const p2 =
      usePhase2 && s.experience >= b2.slope * s.softSkill + b2.intercept;
    const p3 =
      usePhase2 && b3 != null && s.softSkill >= b3.slope * s.techScore + b3.intercept;
    return { id: s.id, hired: p1 || p2 || p3 };
  });
}

export type Metrics = {
  accuracy: number;
  tprA: number;
  tprB: number;
  tprGap: number;
  fnA: number;
  fnB: number;
  hired: number;
};

/* ── Slider gradient hint ─────────────────────────────────────────────────── */

export type SliderHint = { dir: -1 | 0 | 1; target: "accuracy" | "gap" };

/**
 * For a single slider (boundary + param), compute which direction of movement
 * improves the currently-failing metric.  Returns dir=0 when both metrics pass
 * or when the slider has no measurable effect.
 */
export function computeSliderHint(
  dataset: CVSample[],
  b1: BoundaryParams,
  b2: BoundaryParams,
  b3: BoundaryParams,
  usePhase2: boolean,
  boundaryKey: "b1" | "b2" | "b3",
  paramKey: "slope" | "intercept",
  current: Metrics,
): SliderHint {
  const accFail = current.accuracy < 0.8;
  const gapFail = usePhase2 && current.tprGap > 0.05;
  if (!accFail && !gapFail) return { dir: 0, target: "accuracy" };

  const target: "accuracy" | "gap" = accFail ? "accuracy" : "gap";
  const delta = paramKey === "slope" ? 0.05 : 3;

  const tweak = (b: BoundaryParams, sign: number): BoundaryParams => ({
    slope: b.slope + (paramKey === "slope" ? sign * delta : 0),
    intercept: b.intercept + (paramKey === "intercept" ? sign * delta : 0),
  });

  const pick = (key: string, b: BoundaryParams, sign: number) =>
    key === boundaryKey ? tweak(b, sign) : b;

  const mPlus = computeMetrics(
    dataset,
    predictAll(dataset, pick("b1", b1, 1), pick("b2", b2, 1), usePhase2, pick("b3", b3, 1)),
  );
  const mMinus = computeMetrics(
    dataset,
    predictAll(dataset, pick("b1", b1, -1), pick("b2", b2, -1), usePhase2, pick("b3", b3, -1)),
  );

  if (target === "accuracy") {
    const d = mPlus.accuracy - mMinus.accuracy;
    return { dir: Math.abs(d) < 0.001 ? 0 : d > 0 ? 1 : -1, target };
  }
  const d = mPlus.tprGap - mMinus.tprGap;
  return { dir: Math.abs(d) < 0.001 ? 0 : d < 0 ? 1 : -1, target };
}

export function computeMetrics(
  samples: CVSample[],
  preds: PredResult[],
): Metrics {
  const hiredSet = new Set(preds.filter((p) => p.hired).map((p) => p.id));
  let tp = 0,
    tn = 0;
  let tpA = 0,
    fnA = 0,
    tpB = 0,
    fnB = 0;

  for (const s of samples) {
    const h = hiredSet.has(s.id);
    if (s.qualified && h) {
      tp++;
      s.group === "A" ? tpA++ : tpB++;
    } else if (s.qualified && !h) {
      s.group === "A" ? fnA++ : fnB++;
    } else if (!s.qualified && !h) {
      tn++;
    }
  }

  const tprA = tpA + fnA > 0 ? tpA / (tpA + fnA) : 0;
  const tprB = tpB + fnB > 0 ? tpB / (tpB + fnB) : 0;

  return {
    accuracy: (tp + tn) / samples.length,
    tprA,
    tprB,
    tprGap: Math.abs(tprA - tprB),
    fnA,
    fnB,
    hired: hiredSet.size,
  };
}
