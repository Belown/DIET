export type RId = 0 | 1 | 2 | 3;

export type Region = {
  id: RId;
  label: string;
  desc: string;
  xMean: number;
  yMean: number;
  std: number;
  suspRate: number;
  color: string;
};

export type DPt = {
  id: number;
  x: number;
  y: number;
  region: RId;
  suspicious: boolean;
};

export type BriefingSheet = {
  title: string;
  body: string;
  notes: string[];
};

export type DemoBoundary = {
  slope: number;
  intercept: number;
};

export type PopulationOption = 100 | 500 | 1000;
export type QuestionKey = "daily-routine" | "phone-model" | "past-police-stops";

export type QuestionOption = {
  key: QuestionKey;
  label: string;
  tactic: string;
  why: string;
  cost: number;
  flavor: string[];
};

export type MissionPlan = {
  id: string;
  population: PopulationOption;
  zones: boolean[];
  zoneDistribution: number[];
  questions: QuestionKey[];
  weight: number;
  cost: number;
  flavorLines: Record<QuestionKey, string>;
};

export type StrategySummary = {
  regionAccs: number[];
  otherCityAccs: number[];
  sampledFlags: boolean[];
  committedCount: number;
};
