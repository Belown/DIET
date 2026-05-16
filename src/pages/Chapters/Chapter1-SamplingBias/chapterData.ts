import type { PassageId } from "./staticPassages";
import type { BriefingSheet, PopulationOption, QuestionOption, Region } from "./types";

export const REGIONS: readonly Region[] = [
  { id: 0, label: "Uptown",       desc: "Wealthy, privileged area",        xMean: 28, yMean: 25, std: 8, suspRate: 0.12, color: "#494fdf" },
  { id: 1, label: "Downtown",     desc: "Busy commercial area",            xMean: 22, yMean: 20, std: 7, suspRate: 0.10, color: "#7c3aed" },
  { id: 2, label: "Factory Zone", desc: "Working-class area",              xMean: 68, yMean: 70, std: 9, suspRate: 0.13, color: "#e61e49" },
  { id: 3, label: "\n The \n Slums",    desc: "Unpredictable, low-income area",  xMean: 62, yMean: 66, std: 9, suspRate: 0.11, color: "#e8a308" },
] as const;

export const BRIEFING_SHEETS: Partial<Record<PassageId, BriefingSheet>> = {
  "demo-exercise": {
    title: "Boundary Drawing Exercise",
    body: "Before you build the real dataset, you need to understand <b>why the original model failed</b>. Here is what the police saw: subset from a single region - Uptown with 20 residents. Draw a boundary that reaches <b> <u>100%</u></b> training accuracy before submitting it.",
    notes: [
      "Slide the slope and shift controls below until the training accuracy is 100%.",
      "Think about what could a perfect score means in this context.",
      "If the line can separate the dots perfectly, is it then <i>perfect?</i>",
    ],
  },
  "demo-reveal-sheet": {
    title: "Deployment Reveal",
    body: "The same boundary is now tested against the city the model was supposed to serve: all <b>four</b> regions, <b>1000</b> residents and patterns the previous sample never showed.",
    notes: [
      "Different dataset usually have <b>different characteristics.</b>",
      "A model trained on single dataset can <b>misclassify</b> patterns from a different dataset.",
      "This is <b><red>sampling bias</red></b>: a rule tuned on one narrow slice cannot generalize to the general population.",
    ],
  },
};

export const DAILY_BUDGET = 100;
export const POP_COST: Record<PopulationOption, number> = { 100: 15, 500: 40, 1000: 80 };
export const ZONE_COST = 5;

export const QUESTION_OPTIONS: QuestionOption[] = [
  {
    key: "daily-routine",
    label: "Daily Routine",
    tactic: "Check Work ID",
    why: "The detective checks ID to record whether someone is on a registered night shift.",
    cost: 10,
    flavor: [
      "Show me your employment pass, please.",
      "Scanning Transit ID for daily work route...",
      "Please state your registered job shift.",
    ],
  },
  {
    key: "phone-model",
    label: "Phone Model",
    tactic: "Pinging Device",
    why: "The detective records the resident's device model as an additional case field.",
    cost: 10,
    flavor: [
      "Pinging local comm-link network...",
      "Identifying device manufacturer...",
      "Scanning target's phone OS version.",
    ],
  },
  {
    key: "past-police-stops",
    label: "Past Police Stops",
    tactic: "Run Police Record",
    why: "The detective records whether prior police stops appear in the resident's file.",
    cost: 10,
    flavor: [
      "Querying New Eden Police Database...",
      "Checking for prior stop-and-frisk records...",
      "Running background check for past detainments.",
    ],
  },
];
