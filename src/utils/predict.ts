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
