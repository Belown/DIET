import type { FairnessDefinitionId, StudyMetricId } from "./chapter2Data";
import { BASELINE_FIGURES } from "./chapter2Data";

export type RaceCode = "B" | "W";

export type Defendant = {
  id: string;
  race: RaceCode;
  /** Ground truth for this educational simulation (unknown to player until end of day). */
  willReoffend: boolean;
  /** Instrument output: high / low risk bucket. */
  riskBand: "high" | "low";
};

export type DayCommit = {
  dayIndex: number;
  population: Defendant[];
  decisions: Record<string, "detain" | "release">;
  orderedStudy: StudyMetricId | null;
};

const rand = () => Math.random();

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Small daily jitter around published headline numbers. */
export function jitterRate(base: number, spread = 0.035) {
  return clamp01(base + (rand() - 0.5) * 2 * spread);
}

export function formatPct(x: number) {
  return `${Math.round(x * 100)}%`;
}

export function studyReadout(metric: StudyMetricId) {
  const row = BASELINE_FIGURES[metric];
  return {
    metric,
    black: jitterRate(row.black),
    white: jitterRate(row.white),
  };
}

export function algorithmDecision(d: Defendant): "detain" | "release" {
  return d.riskBand === "high" ? "detain" : "release";
}

export function generatePopulation(dayIndex: number, size = 12): Defendant[] {
  // Slightly different cohort texture each day (still plausible).
  const blackShare = clamp01(0.52 + (rand() - 0.5) * 0.08 + dayIndex * 0.008);

  return Array.from({ length: size }, (_, i) => {
    const race: RaceCode = rand() < blackShare ? "B" : "W";
    const baseRec = race === "B" ? 0.51 : 0.39;
    const willReoffend = rand() < clamp01(baseRec + (rand() - 0.5) * 0.06);

    // ProPublica-style pattern: higher FPR for Black among non-recidivists; higher FNR for White among recidivists.
    const pHighIfNot = race === "B" ? 0.449 : 0.235;
    const pHighIfYes = race === "B" ? 1 - 0.28 : 1 - 0.477;

    const pHigh = willReoffend ? pHighIfYes : pHighIfNot;
    const riskBand: "high" | "low" = rand() < clamp01(pHigh + (rand() - 0.5) * 0.05) ? "high" : "low";

    return {
      id: `d${dayIndex}-${i}`,
      race,
      willReoffend,
      riskBand,
    };
  });
}

type Confusion = {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
};

function confusionForGroup(defs: Defendant[], decisions: Record<string, "detain" | "release">, race: RaceCode): Confusion {
  const c: Confusion = { tp: 0, fp: 0, tn: 0, fn: 0 };
  for (const d of defs) {
    if (d.race !== race) continue;
    const predReoffend = decisions[d.id] === "detain";
    const act = d.willReoffend;
    if (predReoffend && act) c.tp += 1;
    if (predReoffend && !act) c.fp += 1;
    if (!predReoffend && !act) c.tn += 1;
    if (!predReoffend && act) c.fn += 1;
  }
  return c;
}

function safeRate(num: number, den: number) {
  if (den <= 0) return 0;
  return num / den;
}

/** Score in [0, 100] for the day, depending on chosen fairness lens. */
export function scoreDay(
  defs: Defendant[],
  decisions: Record<string, "detain" | "release">,
  fairness: FairnessDefinitionId
): number {
  const cB = confusionForGroup(defs, decisions, "B");
  const cW = confusionForGroup(defs, decisions, "W");

  const fprB = safeRate(cB.fp, cB.fp + cB.tn);
  const fprW = safeRate(cW.fp, cW.fp + cW.tn);
  const fnrB = safeRate(cB.fn, cB.fn + cB.tp);
  const fnrW = safeRate(cW.fn, cW.fn + cW.tp);

  const accB = safeRate(cB.tp + cB.tn, cB.tp + cB.fp + cB.tn + cB.fn);
  const accW = safeRate(cW.tp + cW.tn, cW.tp + cW.fp + cW.tn + cW.fn);

  const highB = defs.filter((d) => d.race === "B" && decisions[d.id] === "detain");
  const highW = defs.filter((d) => d.race === "W" && decisions[d.id] === "detain");
  const ppvB = safeRate(highB.filter((d) => d.willReoffend).length, highB.length);
  const ppvW = safeRate(highW.filter((d) => d.willReoffend).length, highW.length);

  const libertyPenalty = defs.reduce((sum, d) => {
    const det = decisions[d.id] === "detain";
    if (det && !d.willReoffend) return sum + 3.2;
    if (!det && d.willReoffend) return sum + 1.1;
    return sum + 0.2;
  }, 0);

  const parityFpr = Math.abs(fprB - fprW);
  const parityFnr = Math.abs(fnrB - fnrW);
  const parityPpv = Math.abs(ppvB - ppvW);
  const accGap = Math.abs(accB - accW);

  let raw = 72;

  if (fairness === "equal-fpr") {
    raw += 38 * (0.22 - parityFpr);
    raw -= 10 * parityFnr;
  } else if (fairness === "equal-fnr") {
    raw += 36 * (0.25 - parityFnr);
    raw -= 9 * parityFpr;
  } else if (fairness === "predictive-parity") {
    raw += 44 * (0.12 - parityPpv);
    raw -= 7 * (parityFpr + parityFnr);
  } else if (fairness === "max-accuracy") {
    raw += 46 * ((accB + accW) / 2 - 0.62) - 6 * accGap;
  } else {
    // liberty-first
    raw -= libertyPenalty;
    raw += 6 * (0.18 - parityFpr);
  }

  // Small universal bonus for avoiding catastrophic misses.
  const misses = defs.filter((d) => decisions[d.id] === "release" && d.willReoffend).length;
  raw -= misses * 1.2;

  return clamp01(raw / 100) * 100;
}

export function summarizeDayForPlayer(defs: Defendant[], decisions: Record<string, "detain" | "release">) {
  const wrongDetentions = defs.filter((d) => decisions[d.id] === "detain" && !d.willReoffend).length;
  const missedRisk = defs.filter((d) => decisions[d.id] === "release" && d.willReoffend).length;
  return { wrongDetentions, missedRisk };
}
