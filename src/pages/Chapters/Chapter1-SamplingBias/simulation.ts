import { POP_COST, QUESTION_OPTIONS, ZONE_COST } from "./chapterData";
import type { DemoBoundary, DPt, MissionPlan, PopulationOption, QuestionKey, RId, StrategySummary } from "./types";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randNormal(rand: () => number, mean: number, std: number): number {
  const u = Math.max(1e-10, 1 - rand());
  const v = rand();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

export const DEMO_BOUNDARY_START: DemoBoundary = { slope: 1, intercept: 0 };

export const isFlagged = (p: DPt, b: DemoBoundary) => p.y >= b.slope * p.x + b.intercept;

export function accOf(pts: DPt[], b: DemoBoundary): number {
  if (!pts.length) return 0;
  return pts.filter((p) => isFlagged(p, b) === p.suspicious).length / pts.length;
}

function genLabeledCluster(
  region: RId,
  count: number,
  seed: number,
  xMean: number,
  yMean: number,
  std: number,
  suspicious: boolean,
): DPt[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: region * 1_000_000 + seed * 1000 + i,
    x: clamp(r1(randNormal(rand, xMean, std)), 0, 100),
    y: clamp(r1(randNormal(rand, yMean, std)), 0, 100),
    region,
    suspicious,
  }));
}

const SEED = 20260503;

export const DEMO_INIT = [
  ...genLabeledCluster(0, 10, SEED, 18, 18, 4, false),
  ...genLabeledCluster(0, 10, SEED + 1, 42, 46, 4, true),
];

export const DEMO_FULL = [
  ...genLabeledCluster(0, 175, SEED + 2, 18, 18, 5, false),
  ...genLabeledCluster(0, 75, SEED + 3, 44, 48, 5, true),

  ...genLabeledCluster(1, 180, SEED + 4, 28, 24, 6, false),
  ...genLabeledCluster(1, 70, SEED + 5, 52, 54, 6, true),

  ...genLabeledCluster(2, 220, SEED + 6, 74, 76, 6, false),
  ...genLabeledCluster(2, 30, SEED + 7, 84, 87, 5, true),

  ...genLabeledCluster(3, 185, SEED + 8, 62, 66, 7, false),
  ...genLabeledCluster(3, 65, SEED + 9, 80, 83, 6, true),
];

export function calcMissionCost(pop: PopulationOption, zoneCount: number, questions: QuestionKey[]): number {
  const questionCost = questions.reduce((sum, key) => {
    return sum + (QUESTION_OPTIONS.find((q) => q.key === key)?.cost ?? 0);
  }, 0);
  return POP_COST[pop] + zoneCount * ZONE_COST + questionCost;
}

export function summarizeStrategy(plansByDay: MissionPlan[][], dayLocked: boolean[]): StrategySummary {
  const committed = plansByDay.flatMap((plans, i) => (dayLocked[i] ? plans : []));
  const zoneSamples = [0, 0, 0, 0];
  let usefulSignal = 0;
  let noiseSignal = 0;
  let biasSignal = 0;

  for (const p of committed) {
    const zoneCount = p.zones.filter(Boolean).length;
    if (!zoneCount) continue;
    p.zones.forEach((on, idx) => {
      if (on) zoneSamples[idx] += p.population * p.weight * p.zoneDistribution[idx];
    });
    if (p.questions.includes("daily-routine")) usefulSignal += p.population * p.weight;
    if (p.questions.includes("phone-model")) noiseSignal += p.population * p.weight;
    if (p.questions.includes("past-police-stops")) biasSignal += p.population * p.weight;
  }

  const sampledFlags = zoneSamples.map((s) => s > 0);
  const diversity = sampledFlags.filter(Boolean).length / 4;
  const usefulBonus = Math.min(0.12, usefulSignal / 4000);
  const noisePenalty = Math.min(0.04, noiseSignal / 9000);
  const biasBoostSeen = Math.min(0.05, biasSignal / 9000);
  const biasPenaltyUnseen = Math.min(0.15, biasSignal / 5000);

  const regionAccs = zoneSamples.map((s, i) => {
    const coverage = Math.min(1, s / 500);
    let acc = 0.50 + 0.25 * coverage + 0.10 * diversity + usefulBonus - noisePenalty;
    if (sampledFlags[i]) acc += biasBoostSeen;
    if (!sampledFlags[i]) acc -= 0.1 + biasPenaltyUnseen;
    return clamp(acc, 0.22, 0.96);
  });

  const otherCityAccs = regionAccs.map((a, i) => {
    let transfer = a - 0.08;
    transfer += Math.min(0.05, usefulSignal / 9000);
    transfer -= Math.min(0.05, noiseSignal / 8000);
    transfer -= Math.min(0.12, biasSignal / 6000);
    if (!sampledFlags[i]) transfer -= 0.05;
    return clamp(transfer, 0.18, 0.9);
  });

  return {
    regionAccs,
    otherCityAccs,
    sampledFlags,
    committedCount: committed.length,
    usefulSignal,
    noiseSignal,
    biasSignal,
  };
}
