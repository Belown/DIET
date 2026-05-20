import type { FairnessDefinitionId, StudyMetricId } from "./chapter2Data";
import type { StudyResult } from "./chapter2Simulation";

export type DayRecord = {
  day: number;
  metricActive: FairnessDefinitionId;
  studiesQueued: StudyMetricId[];
  costDeducted: number;
  results: StudyResult[];
  dailyAccuracy?: number;
};

export type Chapter2GameState = {
  currentDay: number;
  fairnessMetric: FairnessDefinitionId;
  metricChangedToday: boolean;
  budget: number;
  aggregateAccuracy: number[];
  days: DayRecord[];
  pendingQueue: StudyMetricId[];
};

export const INITIAL_GAME_STATE: Chapter2GameState = {
  currentDay: 0,
  fairnessMetric: "equal_rates",
  metricChangedToday: false,
  budget: 1000,
  aggregateAccuracy: [],
  days: [],
  pendingQueue: [],
};
