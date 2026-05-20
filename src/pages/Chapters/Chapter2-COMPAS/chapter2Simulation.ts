import type { FairnessDefinitionId, StudyMetricId } from "./chapter2Data";
import { BASELINE_FIGURES } from "./chapter2Data";

export type RaceCode = "B" | "W";

export type Defendant = {
  id: string;
  race: RaceCode;
  willReoffend: boolean;
  riskBand: "high" | "low";
};

export type StudyOutcome = "win" | "warn" | "neutral";

export type StudyResult = {
  metricId: StudyMetricId;
  black: number;
  white: number;
  blackSecondary?: number;
  whiteSecondary?: number;
  secondaryLabel?: string;
  outcome: StudyOutcome;
  interpretation: string;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Deterministic 0–1 from session inputs (stable re-reads). */
export function studySeed(dayIndex: number, metricId: StudyMetricId, launchIndex: number, fairness: FairnessDefinitionId) {
  let h = dayIndex * 997 + launchIndex * 131;
  for (const c of metricId) h = (h * 31 + c.charCodeAt(0)) | 0;
  for (const c of fairness) h = (h * 31 + c.charCodeAt(0)) | 0;
  h = (h ^ (h >>> 16)) * 0x45d9f3b;
  h = (h ^ (h >>> 16)) >>> 0;
  return (h % 10000) / 10000;
}

function jitter(base: number, seed: number, spread: number) {
  return clamp01(base + (seed - 0.5) * 2 * spread);
}

export function formatPct(x: number) {
  return `${Math.round(x * 100)}%`;
}

export function algorithmDecision(d: Defendant): "detain" | "release" {
  return d.riskBand === "high" ? "detain" : "release";
}

export function machineDecisions(population: Defendant[]): Record<string, "detain" | "release"> {
  const out: Record<string, "detain" | "release"> = {};
  for (const d of population) out[d.id] = algorithmDecision(d);
  return out;
}

export function generatePopulation(dayIndex: number, size = 12): Defendant[] {
  const seedBase = studySeed(dayIndex, "accuracy-overall", 0, "max_accuracy");
  const rand = (i: number) => studySeed(dayIndex, "fpr-fnr-by-race", i, "equal_rates");

  const blackShare = clamp01(0.52 + (seedBase - 0.5) * 0.08);

  return Array.from({ length: size }, (_, i) => {
    const r = rand(i);
    const race: RaceCode = r < blackShare ? "B" : "W";
    const baseRec = race === "B" ? 0.51 : 0.39;
    const willReoffend = studySeed(dayIndex, "ppv-high-risk", i, "predictive_parity") < clamp01(baseRec + 0.03);

    const pHighIfNot = race === "B" ? BASELINE_FIGURES.fprBlack : BASELINE_FIGURES.fprWhite;
    const pHighIfYes = race === "B" ? 1 - BASELINE_FIGURES.fnrBlack : 1 - BASELINE_FIGURES.fnrWhite;
    const pHigh = willReoffend ? pHighIfYes : pHighIfNot;
    const riskBand: "high" | "low" =
      studySeed(dayIndex, "tpr-tnr-by-race", i, "equal_rates") < clamp01(pHigh + 0.04) ? "high" : "low";

    return { id: `d${dayIndex}-${i}`, race, willReoffend, riskBand };
  });
}

type Confusion = { tp: number; fp: number; tn: number; fn: number };

function confusionForGroup(defs: Defendant[], decisions: Record<string, "detain" | "release">, race: RaceCode): Confusion {
  const c: Confusion = { tp: 0, fp: 0, tn: 0, fn: 0 };
  for (const d of defs) {
    if (d.race !== race) continue;
    const pred = decisions[d.id] === "detain";
    const act = d.willReoffend;
    if (pred && act) c.tp += 1;
    if (pred && !act) c.fp += 1;
    if (!pred && !act) c.tn += 1;
    if (!pred && act) c.fn += 1;
  }
  return c;
}

function safeRate(num: number, den: number) {
  if (den <= 0) return 0;
  return num / den;
}

/** Daily accuracy score in [0, 100] for machine decisions under the chosen fairness lens. */
export function scoreDay(
  defs: Defendant[],
  decisions: Record<string, "detain" | "release">,
  fairness: FairnessDefinitionId,
): number {
  const cB = confusionForGroup(defs, decisions, "B");
  const cW = confusionForGroup(defs, decisions, "W");

  const tprB = safeRate(cB.tp, cB.tp + cB.fn);
  const tprW = safeRate(cW.tp, cW.tp + cW.fn);
  const tnrB = safeRate(cB.tn, cB.tn + cB.fp);
  const tnrW = safeRate(cW.tn, cW.tn + cW.fp);

  const fprB = safeRate(cB.fp, cB.fp + cB.tn);
  const fprW = safeRate(cW.fp, cW.fp + cW.tn);
  const fnrB = safeRate(cB.fn, cB.fn + cB.tp);
  const fnrW = safeRate(cW.fn, cW.fn + cW.tp);

  const accOverall = safeRate(
    cB.tp + cB.tn + cW.tp + cW.tn,
    cB.tp + cB.fp + cB.tn + cB.fn + cW.tp + cW.fp + cW.tn + cW.fn,
  );

  const highB = defs.filter((d) => d.race === "B" && decisions[d.id] === "detain");
  const highW = defs.filter((d) => d.race === "W" && decisions[d.id] === "detain");
  const ppvB = safeRate(highB.filter((d) => d.willReoffend).length, highB.length);
  const ppvW = safeRate(highW.filter((d) => d.willReoffend).length, highW.length);

  const gapTpr = Math.abs(tprB - tprW);
  const gapTnr = Math.abs(tnrB - tnrW);
  const gapFpr = Math.abs(fprB - fprW);
  const gapFnr = Math.abs(fnrB - fnrW);
  const gapPpv = Math.abs(ppvB - ppvW);

  let raw = 68;

  if (fairness === "equal_rates") {
    raw += 40 * (0.08 - (gapTpr + gapTnr) / 2);
    raw += 18 * (0.1 - (gapFpr + gapFnr) / 2);
    raw -= 12 * gapPpv;
    raw += 8 * (accOverall - 0.62);
  } else if (fairness === "predictive_parity") {
    raw += 44 * (0.06 - gapPpv);
    raw -= 14 * (gapFpr + gapFnr) / 2;
    raw -= 10 * (gapTpr + gapTnr) / 2;
    raw += 6 * (accOverall - 0.6);
  } else {
    raw += 50 * (accOverall - 0.64);
    raw -= 10 * gapPpv;
    raw -= 8 * (gapFpr + gapFnr) / 2;
    raw -= 6 * (gapTpr + gapTnr) / 2;
  }

  return clamp01(raw / 100) * 100;
}

export function aggregatedAccuracy(dayScores: number[]) {
  if (!dayScores.length) return 0;
  return dayScores.reduce((a, b) => a + b, 0) / dayScores.length;
}

/** Seeded daily accuracy for completed work nights (Days 1–3 display). */
export function computeDailyAccuracy(fairness: FairnessDefinitionId, workNightIndex: number): number {
  const seed = studySeed(workNightIndex, "accuracy-overall", 0, fairness);
  const bands: Record<FairnessDefinitionId, [number, number]> = {
    equal_rates: [71, 75],
    predictive_parity: [72, 76],
    max_accuracy: [82, 87],
  };
  const [lo, hi] = bands[fairness];
  const mid = (lo + hi) / 2;
  const jitter = (seed - 0.5) * 4;
  return Math.round((mid + jitter) * 10) / 10;
}

export function resolveDayStudies(
  studiesQueued: StudyMetricId[],
  metricActive: FairnessDefinitionId,
  workNightIndex: number,
): StudyResult[] {
  return studiesQueued.map((metricId, launchIndex) =>
    generateStudyResult(metricId, metricActive, workNightIndex, launchIndex),
  );
}

type MetricProfile = {
  outcome: StudyOutcome;
  black: number;
  white: number;
  blackSecondary?: number;
  whiteSecondary?: number;
  secondaryLabel?: string;
  interpretation: string;
};

function profileForMetric(
  metricId: StudyMetricId,
  fairness: FairnessDefinitionId,
  seed: number,
): MetricProfile {
  const s = seed;
  const B = BASELINE_FIGURES;

  if (metricId === "fpr-fnr-by-race") {
    if (fairness === "equal_rates") {
      const gap = jitter(0.03, s, 0.02);
      return {
        outcome: "win",
        black: jitter(0.26, s, 0.03),
        white: jitter(0.26 + gap, s + 0.1, 0.03),
        blackSecondary: jitter(0.31, s + 0.2, 0.03),
        whiteSecondary: jitter(0.31 + gap, s + 0.3, 0.03),
        secondaryLabel: "FNR",
        interpretation:
          "Under equal error‑rate constraints, FPR and FNR line up much more closely across groups — a direct win for your chosen metric. This is what your office asked the instrument to prioritise, and the audit reflects it.",
      };
    }
    if (fairness === "predictive_parity") {
      const gap = jitter(0.19, s, 0.04);
      return {
        outcome: "warn",
        black: jitter(B.fprBlack, s, 0.03),
        white: jitter(B.fprWhite, s + 0.1, 0.03),
        blackSecondary: jitter(B.fnrBlack, s + 0.2, 0.03),
        whiteSecondary: jitter(B.fnrWhite + gap * 0.5, s + 0.3, 0.04),
        secondaryLabel: "FNR",
        interpretation:
          "Chasing equal PPV tends to push FPR/FNR apart when base rates differ — exactly the incompatibility ProPublica highlighted. Your active metric is not error‑rate parity, so this gap is expected rather than a surprise bug.",
      };
    }
    const gap = jitter(0.24, s, 0.04);
    return {
      outcome: "warn",
      black: jitter(B.fprBlack + 0.02, s, 0.03),
      white: jitter(B.fprWhite, s + 0.1, 0.03),
      blackSecondary: jitter(B.fnrBlack, s + 0.2, 0.03),
      whiteSecondary: jitter(B.fnrWhite + gap * 0.3, s + 0.3, 0.04),
      secondaryLabel: "FNR",
      interpretation:
        "Maximising overall accuracy often widens group error gaps — the instrument looks “better” in aggregate while burdens stay uneven. Under max‑accuracy tuning, FPR/FNR disparities are typically the worst of the three fairness strategies.",
    };
  }

  if (metricId === "tpr-tnr-by-race") {
    if (fairness === "equal_rates") {
      const gap = jitter(0.04, s, 0.02);
      return {
        outcome: "win",
        black: jitter(0.71, s, 0.03),
        white: jitter(0.71 + gap, s + 0.1, 0.03),
        blackSecondary: jitter(0.7, s + 0.2, 0.03),
        whiteSecondary: jitter(0.7 + gap, s + 0.3, 0.03),
        secondaryLabel: "TNR",
        interpretation:
          "TPR and TNR move toward parity — this is the operational face of equal error rates on your docket. Equalising who gets which kind of correct call is the heart of the metric you queued studies under.",
      };
    }
    if (fairness === "predictive_parity") {
      const gap = jitter(0.16, s, 0.04);
      return {
        outcome: "warn",
        black: jitter(B.tprBlack, s, 0.03),
        white: jitter(B.tprWhite, s + 0.1, 0.03),
        blackSecondary: jitter(B.tnrBlack, s + 0.2, 0.03),
        whiteSecondary: jitter(B.tnrWhite - gap, s + 0.3, 0.04),
        secondaryLabel: "TNR",
        interpretation:
          "Equalising high‑risk calibration usually distorts TPR/TNR — another sign that one fairness definition cannot satisfy every test at once. Predictive parity and equal error rates pull the model in different directions when base rates differ.",
      };
    }
    const gap = jitter(0.2, s, 0.04);
    return {
      outcome: "warn",
      black: jitter(B.tprBlack + gap * 0.3, s, 0.03),
      white: jitter(B.tprWhite, s + 0.1, 0.03),
      blackSecondary: jitter(B.tnrBlack, s + 0.2, 0.03),
      whiteSecondary: jitter(B.tnrWhite + gap * 0.2, s + 0.3, 0.04),
      secondaryLabel: "TNR",
      interpretation:
        "Accuracy‑first tuning lets TPR/TNR diverge sharply — the scoreboard improves while group‑wise treatment does not. This is among the starkest TPR/TNR gaps you will see across the three metrics.",
    };
  }

  if (metricId === "ppv-high-risk") {
    if (fairness === "predictive_parity") {
      const gap = jitter(0.03, s, 0.02);
      return {
        outcome: "win",
        black: jitter(0.61, s, 0.03),
        white: jitter(0.61 + gap, s + 0.1, 0.03),
        interpretation:
          "PPV aligns across groups — your predictive‑parity mandate is doing what it promises on the high‑risk slice. Among people flagged high risk, rearrest rates now look similar across racial groups.",
      };
    }
    if (fairness === "equal_rates") {
      const gap = jitter(0.14, s, 0.03);
      return {
        outcome: "warn",
        black: jitter(B.ppvBlack, s, 0.03),
        white: jitter(B.ppvWhite + gap, s + 0.1, 0.03),
        interpretation:
          "Equal error rates often sacrifice predictive parity — high‑risk flags stop meaning the same thing across groups. That tradeoff is structural: you cannot equalise TPR/TNR and PPV at once when recidivism base rates differ.",
      };
    }
    const gap = jitter(0.13, s, 0.03);
    return {
      outcome: "neutral",
      black: jitter(B.ppvBlack + gap * 0.4, s, 0.03),
      white: jitter(B.ppvWhite, s + 0.1, 0.03),
      interpretation:
        "PPV is neither clearly equal nor dramatically unequal under max‑accuracy tuning — calibration is not the optimisation target. The headline score can look fine while high‑risk slices still mean different things by group.",
    };
  }

  // accuracy-overall
  if (fairness === "max_accuracy") {
    return {
      outcome: "win",
      black: jitter(0.84, s, 0.02),
      white: jitter(0.83, s + 0.1, 0.02),
      interpretation:
        "Aggregate accuracy peaks under your mandate — the highest values of the three strategies. Check error‑rate studies to see who still carries the cost of those correct totals.",
    };
  }
  if (fairness === "equal_rates") {
    return {
      outcome: "neutral",
      black: jitter(0.73, s, 0.02),
      white: jitter(0.74, s + 0.1, 0.02),
      interpretation:
        "Accuracy sits in a moderate band — respectable, but below a pure max‑accuracy run. Equalising TPR/TNR trades away a few easy aggregate points.",
    };
  }
  return {
    outcome: "neutral",
    black: jitter(0.74, s, 0.02),
    white: jitter(0.75, s + 0.1, 0.02),
    interpretation:
      "Accuracy stays moderate under predictive parity — you are balancing calibration, not chasing the global maximum. This is typical when PPV is the primary constraint.",
  };
}

export function generateStudyResult(
  metricId: StudyMetricId,
  fairness: FairnessDefinitionId,
  dayIndex: number,
  launchIndex: number,
): StudyResult {
  const seed = studySeed(dayIndex, metricId, launchIndex, fairness);
  const p = profileForMetric(metricId, fairness, seed);
  return { metricId, ...p };
}
