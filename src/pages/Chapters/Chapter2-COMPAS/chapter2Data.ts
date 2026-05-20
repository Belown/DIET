/**
 * COMPAS / ProPublica-style baselines for educational simulation.
 * @see https://www.propublica.org/article/how-we-analyzed-the-compas-recidivism-algorithm
 */

export type StudyMetricId =
  | "fpr-fnr-by-race"
  | "tpr-tnr-by-race"
  | "ppv-high-risk"
  | "accuracy-overall";

export type FairnessDefinitionId = "equal_rates" | "predictive_parity" | "max_accuracy";

/** Player-facing days: 0 (setup) through 3 (final confirmation). */
export const MAX_CURRENT_DAY = 3;

export const STARTING_BUDGET = 1000;

export const STUDY_METRICS: Array<{
  id: StudyMetricId;
  label: string;
  shortLabel: string;
  cost: number;
  description: string;
}> = [
  {
    id: "fpr-fnr-by-race",
    label: "False positive & false negative rates by race",
    shortLabel: "FPR / FNR by race",
    cost: 120,
    description:
      "Compares how often non‑recidivists are flagged (FPR) and recidivists are missed (FNR) across Black and White defendants.",
  },
  {
    id: "tpr-tnr-by-race",
    label: "True positive & true negative rates by race",
    shortLabel: "TPR / TNR by race",
    cost: 100,
    description:
      "Measures correct detention and correct release rates by group — the mirror of error‑rate parity tests.",
  },
  {
    id: "ppv-high-risk",
    label: "Predictive parity among high‑risk scores (PPV)",
    shortLabel: "PPV / predictive parity",
    cost: 90,
    description:
      "Among defendants flagged high risk, what share actually reoffended? Equal PPV across groups is a calibration‑style fairness test.",
  },
  {
    id: "accuracy-overall",
    label: "Overall accuracy",
    shortLabel: "Overall accuracy",
    cost: 75,
    description:
      "Aggregate correct‑prediction rate — can rise while group‑wise errors stay sharply unequal.",
  },
];

/** ProPublica-style headline baselines (unequal / “raw instrument” reference). */
export const BASELINE_FIGURES = {
  fprBlack: 0.449,
  fprWhite: 0.235,
  fnrBlack: 0.28,
  fnrWhite: 0.477,
  tprBlack: 0.72,
  tprWhite: 0.523,
  tnrBlack: 0.551,
  tnrWhite: 0.765,
  ppvBlack: 0.63,
  ppvWhite: 0.59,
  accuracyOverall: 0.664,
};

export const FAIRNESS_DEFINITIONS: Array<{
  id: FairnessDefinitionId;
  title: string;
  blurb: string;
}> = [
  {
    id: "equal_rates",
    title: "Equal Error Rates",
    blurb: "Equalise True Positive Rate (TPR) and True Negative Rate (TNR) across racial groups.",
  },
  {
    id: "predictive_parity",
    title: "Predictive Parity",
    blurb: "Ensure recidivism rates among high‑risk flags are equal across groups (equal PPV).",
  },
  {
    id: "max_accuracy",
    title: "Maximise Overall Accuracy",
    blurb: "Optimise aggregate accuracy without race‑based constraints.",
  },
];

export const INTRO_CHUNKS = [
  "You are on a four‑night rotation in pretrial services. The COMPAS‑style instrument runs every case automatically — your job is to queue fairness studies and choose which metric the office optimises for.",
  "Studies you queue tonight arrive tomorrow morning. Costs leave your budget when you advance to the next day. You may change the fairness metric once per night (Days 0–2); on the final night you confirm what goes on the record.",
  "Day 0 is planning only — no results yet. Each morning after that, read what last night’s studies revealed, then queue the next batch before advancing again.",
];

export const ENDINGS: Record<FairnessDefinitionId, { headline: string; body: string }> = {
  equal_rates: {
    headline: "Legacy: “We equalised error rates.”",
    body: "Audits show tighter TPR/TNR alignment across groups. Predictive parity and headline accuracy often look worse — the textbook tradeoff when base rates differ. Your term makes that tension visible rather than hiding it behind one aggregate number.",
  },
  predictive_parity: {
    headline: "Legacy: “We held calibration to the light.”",
    body: "High‑risk scores mean more similar things across groups. Error‑rate parity slides — mathematically expected when recidivism base rates diverge. Stakeholders argue whether “fair calibration” is enough if burdens still fall unevenly.",
  },
  max_accuracy: {
    headline: "Legacy: “We maximised the score.”",
    body: "Overall accuracy peaks, but group‑wise error gaps widen. The courthouse gets a clean spreadsheet and messier politics. Your ending documents the oldest temptation: optimise what is easy to count.",
  },
};
