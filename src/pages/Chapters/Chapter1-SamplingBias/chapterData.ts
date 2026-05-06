import type { PassageId } from "./passages";
import type { BriefingSheet, PopulationOption, QuestionOption, Region } from "./types";

export const REGIONS: readonly Region[] = [
  { id: 0, label: "Uptown",       desc: "Wealthy, privileged area",        xMean: 28, yMean: 25, std: 8, suspRate: 0.12, color: "#494fdf" },
  { id: 1, label: "Downtown",     desc: "Busy commercial area",            xMean: 22, yMean: 20, std: 7, suspRate: 0.10, color: "#7c3aed" },
  { id: 2, label: "Factory Zone", desc: "Working-class area",              xMean: 68, yMean: 70, std: 9, suspRate: 0.13, color: "#e61e49" },
  { id: 3, label: "\n The \n Slums",    desc: "Unpredictable, low-income area",  xMean: 62, yMean: 66, std: 9, suspRate: 0.11, color: "#e8a308" },
] as const;

export const BRIEFING_SHEETS: Partial<Record<PassageId, BriefingSheet>> = {
  "demo-intro": {
    title: "Boundary Drawing Exercise",
    body: "Before you build the real dataset, you need to understand why the original model failed. Here is what the police saw: a single region - Uptown. 20 residents. Draw a boundary that reaches 100% training accuracy before submitting it.",
    notes: [
      "Green points are Safe. Red points are Threat. Black rings are mistakes.",
      "Slide the slope and shift controls below until the training accuracy is 100%.",
      "Take your time - this is the same task the original data scientists faced.",
      "A perfect score here only means the line fits this small Uptown sample.",
    ],
  },
  "demo-reveal": {
    title: "Deployment Reveal",
    body: "The same boundary is now tested against the city the model was supposed to serve: all four regions, 1,000 residents, and patterns the Uptown-only sample never showed.",
    notes: [
      "Region 3 contains many safe night-shift workers in the high-activity zone.",
      "A model trained only on Uptown can mistake those workers for threats.",
      "This is sampling bias: a rule tuned on one narrow slice cannot generalize to the whole city.",
    ],
  },
};

export const DAILY_BUDGET = 100;
export const POP_OPTIONS: PopulationOption[] = [100, 500, 1000];
export const POP_COST: Record<PopulationOption, number> = { 100: 15, 500: 40, 1000: 80 };
export const ZONE_COST = 5;

export const QUESTION_OPTIONS: QuestionOption[] = [
  {
    key: "daily-routine",
    label: "Daily Routine (The Useful Context)",
    tactic: "Check Work ID",
    why: "Easy and realistic. The detective checks ID to verify whether someone is truly on a registered night shift.",
    cost: 10,
    flavor: [
      "Show me your employment pass, please.",
      "Scanning Transit ID for daily work route...",
      "Please state your registered job shift.",
    ],
  },
  {
    key: "phone-model",
    label: "Phone Model (The Useless Noise)",
    tactic: "Pinging Device",
    why: "Easy to collect, but mostly useless noise that tells little about actual risk behavior.",
    cost: 10,
    flavor: [
      "Pinging local comm-link network...",
      "Identifying device manufacturer...",
      "Scanning target's phone OS version.",
    ],
  },
  {
    key: "past-police-stops",
    label: "Past Police Stops (The Bias Trap)",
    tactic: "Run Police Record",
    why: "Instantly available, but can import historical policing bias and distort the model.",
    cost: 10,
    flavor: [
      "Querying New Eden Police Database...",
      "Checking for prior stop-and-frisk records...",
      "Running background check for past detainments.",
    ],
  },
];
