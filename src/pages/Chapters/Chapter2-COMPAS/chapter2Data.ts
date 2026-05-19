/**
 * Northpointe COMPAS / ProPublica-style headline figures (approximate public reporting).
 * Used as stable baselines for study readouts with small daily jitter applied at runtime.
 * @see https://www.propublica.org/article/how-we-analyzed-the-compas-recidivism-algorithm
 */

export type StudyMetricId =
  | "fpr-by-race"
  | "fnr-by-race"
  | "ppv-high-risk"
  | "accuracy-by-race"
  | "high-risk-label-rate";

export type FairnessDefinitionId =
  | "equal-fpr"
  | "equal-fnr"
  | "predictive-parity"
  | "max-accuracy"
  | "liberty-first";

export const STUDY_METRICS: Array<{
  id: StudyMetricId;
  label: string;
  shortLabel: string;
  /** Study usefulness varies: some metrics are noisier or less actionable in a single docket. */
  signal: "strong" | "mixed" | "weak";
  description: string;
}> = [
  {
    id: "fpr-by-race",
    label: "False positives among people who did not reoffend",
    shortLabel: "FPR by race",
    signal: "strong",
    description:
      "Share of non‑recidivists who were labeled higher risk — a core ProPublica comparison showing higher FPR for Black defendants in Broward County’s COMPAS cohort.",
  },
  {
    id: "fnr-by-race",
    label: "False negatives among people who reoffended",
    shortLabel: "FNR by race",
    signal: "strong",
    description:
      "Share of recidivists labeled lower risk — often higher for white defendants in the same analysis, creating a mirrored error story to FPR disparities.",
  },
  {
    id: "ppv-high-risk",
    label: "Recidivism among “high risk” scores (calibration)",
    shortLabel: "PPV / calibration",
    signal: "mixed",
    description:
      "Among defendants scored high risk, who actually reoffended? Tools can look “calibrated” while still producing very different burdens across groups.",
  },
  {
    id: "accuracy-by-race",
    label: "Overall accuracy by race",
    shortLabel: "Accuracy by race",
    signal: "mixed",
    description:
      "Simple correct‑rate comparisons can hide who pays which kind of error — but they still shape how administrators justify a model.",
  },
  {
    id: "high-risk-label-rate",
    label: "How often defendants are labeled “high risk”",
    shortLabel: "High‑risk label rate",
    signal: "weak",
    description:
      "A prevalence‑style view: different groups can receive high scores at different rates even when headline calibration numbers look similar.",
  },
];

/** Number of in‑game days equals metrics + 1 (design requirement). */
export const TOTAL_GAME_DAYS = STUDY_METRICS.length + 1;

export const BASELINE_FIGURES: Record<
  StudyMetricId,
  { black: number; white: number; note?: string }
> = {
  "fpr-by-race": { black: 0.449, white: 0.235 },
  "fnr-by-race": { black: 0.28, white: 0.477 },
  "ppv-high-risk": { black: 0.63, white: 0.59 },
  "accuracy-by-race": { black: 0.615, white: 0.73 },
  "high-risk-label-rate": { black: 0.42, white: 0.25 },
};

export const FAIRNESS_DEFINITIONS: Array<{
  id: FairnessDefinitionId;
  title: string;
  blurb: string;
  scoringHint: string;
}> = [
  {
    id: "equal-fpr",
    title: "Equalize false positives",
    blurb: "You prioritize similar false‑positive burdens across racial groups — even if that strains other error types.",
    scoringHint: "Rewards shrinking the FPR gap; penalizes releasing extra high‑risk signals without cause.",
  },
  {
    id: "equal-fnr",
    title: "Equalize false negatives",
    blurb: "You prioritize similar false‑negative burdens across groups — watching closely for “missed risk” asymmetry.",
    scoringHint: "Rewards shrinking the FNR gap; still cares about obvious public‑safety misses.",
  },
  {
    id: "predictive-parity",
    title: "Predictive parity (high‑risk slice)",
    blurb: "You want comparable recidivism rates among people flagged high risk — a calibration‑style lens on the risk score’s top bucket.",
    scoringHint: "Rewards decisions that keep high‑risk slices similarly “truthful” across groups.",
  },
  {
    id: "max-accuracy",
    title: "Maximize overall accuracy",
    blurb: "You treat the score as a blunt instrument: if it raises aggregate accuracy, you’ll follow it — parity is secondary.",
    scoringHint: "Rewards matching outcomes on your docket; pays less attention to group‑wise error gaps.",
  },
  {
    id: "liberty-first",
    title: "Liberty‑first screening",
    blurb: "You detain sparingly: false detention weighs heavily, even when that means accepting more missed risk.",
    scoringHint: "Rewards release‑leaning choices when innocence is likely; punishes needless detention.",
  },
];

export const STUDY_COST = 22;
export const DAILY_OPERATING_COST = 6;
export const STARTING_RESOURCES = 96;

export const INTRO_CHUNKS = [
  "You are filling a rotating bench assignment in pretrial services. Each morning, a new docket arrives — different people, different noise, no do‑overs for yesterday’s calls.",
  "A risk score (think: COMPAS‑style) recommends detention or release. You can follow it, or override case‑by‑case. You never see the future — only the score, the file notes you’re given, and whatever your office can afford to study.",
  "Studies take time: a metric you request today lands tomorrow, with sampling noise. Metrics grounded in ProPublica’s Broward analysis will drift slightly day‑to‑day — but they’ll stay in the same uncomfortable neighborhood.",
  "Pick the fairness lens you want to start from. You may change your mind later — but the city will remember the last lens you claimed when the term ends.",
];

export const ENDINGS: Record<
  FairnessDefinitionId,
  { headline: string; body: string }
> = {
  "equal-fpr": {
    headline: "Legacy: “We watched the false‑positive gap.”",
    body: "Your office becomes known for tight FPR audits — and for pushing infrastructure (counsel, time, data) toward preventing mis‑labels of innocence. Defense coalitions trust the docket more; some prosecutors complain you slow charging velocity. The tradeoff you picked is visible: fewer “easy wins” on raw clearance, more friction where errors hurt liberty.",
  },
  "equal-fnr": {
    headline: "Legacy: “We watched the false‑negative gap.”",
    body: "Your term normalizes FNR reviews after major incidents — the courthouse steers resources toward catching missed risk. Civil‑rights auditors note detention creep; victim‑services advocates see faster safety nets. The mirror error to FPR parity becomes your public moral: who is asked to carry “missed risk,” and when is that fair?",
  },
  "predictive-parity": {
    headline: "Legacy: “We treated calibration as the north star.”",
    body: "You leave behind a court culture that interrogates whether high scores mean the same thing across groups. That discipline can stabilize trust — and can also blind you to base‑rate differences that make other fairness tests scream. Your ending is not “neutral math”; it’s a choice to spotlight one slice of the scorecard.",
  },
  "max-accuracy": {
    headline: "Legacy: “We optimized what was easy to count.”",
    body: "The spreadsheet looks cleaner: overall accuracy rises. But the docket still isn’t symmetric pain — errors concentrate differently across communities even when totals improve. Your legacy is the technocrat’s temptation: a number that felt objective because it was loud.",
  },
  "liberty-first": {
    headline: "Legacy: “We paid down detention debt.”",
    body: "Jail counts fall; pretrial supervision expands. Some preventable harm still happens — you knew that trade was priced in. The city argues about whether mercy was wisdom or weather: your ending insists that cages are costs, not defaults.",
  },
};

export function studySignalLabel(signal: (typeof STUDY_METRICS)[number]["signal"]) {
  if (signal === "strong") return "Likely to clarify strategy quickly.";
  if (signal === "mixed") return "Useful, but easy to over‑read on a small docket.";
  return "Noisy on short horizons — still shapes intuition.";
}
