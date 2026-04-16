export type Group = "A" | "B";

export type CVSample = {
  id: number;
  techScore: number;
  experience: number;
  softSkill: number;
  group: Group;
  qualified: boolean;
};

export type DatasetConfig = {
  seed: number;
  size: number;
  groupBRatio: number;
};

export const DEFAULT_CONFIG: DatasetConfig = {
  seed: 20260414,
  size: 240,
  groupBRatio: 0.5,
};

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

function gaussian(rand: () => number, mean: number, stdDev: number): number {
  const u = 1 - rand();
  const v = rand();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + stdDev * z;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

const GROUP_A_PARAMS = {
  techMean: 72,
  techStd: 12,
  expMean: 68,
  expStd: 14,
};

const GROUP_B_PARAMS = {
  techMean: 58,
  techStd: 12,
  expMean: 54,
  expStd: 14,
};

const SOFT_SKILL_MEAN = 70;
const SOFT_SKILL_STD = 16;

const QUALIFIED_THRESHOLD = 62;

function scoreSample(s: Omit<CVSample, "qualified" | "id">): number {
  return 0.3 * s.techScore + 0.3 * s.experience + 0.4 * s.softSkill;
}

export function generateDataset(
  config: Partial<DatasetConfig> = {},
): CVSample[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const rand = mulberry32(cfg.seed);
  const samples: CVSample[] = [];

  for (let i = 0; i < cfg.size; i++) {
    const group: Group = rand() < cfg.groupBRatio ? "B" : "A";
    const params = group === "A" ? GROUP_A_PARAMS : GROUP_B_PARAMS;

    const techScore = clamp(
      gaussian(rand, params.techMean, params.techStd),
      0,
      100,
    );
    const experience = clamp(
      gaussian(rand, params.expMean, params.expStd),
      0,
      100,
    );
    const softSkill = clamp(
      gaussian(rand, SOFT_SKILL_MEAN, SOFT_SKILL_STD),
      0,
      100,
    );

    const qualified =
      scoreSample({ techScore, experience, softSkill, group }) >=
      QUALIFIED_THRESHOLD;

    samples.push({
      id: i,
      techScore: round1(techScore),
      experience: round1(experience),
      softSkill: round1(softSkill),
      group,
      qualified,
    });
  }

  return samples;
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function generateFreshBatch(
  count: number,
  seed: number,
): CVSample[] {
  return generateDataset({ seed, size: count });
}

export const defaultDataset: CVSample[] = generateDataset();

export type GroupStats = {
  group: Group;
  count: number;
  qualifiedCount: number;
  qualifiedRate: number;
  mean: { techScore: number; experience: number; softSkill: number };
};

export function summarizeByGroup(samples: CVSample[]): GroupStats[] {
  const groups: Group[] = ["A", "B"];
  return groups.map((group) => {
    const rows = samples.filter((s) => s.group === group);
    const count = rows.length;
    const qualifiedCount = rows.filter((s) => s.qualified).length;
    const sum = rows.reduce(
      (acc, s) => {
        acc.tech += s.techScore;
        acc.exp += s.experience;
        acc.port += s.softSkill;
        return acc;
      },
      { tech: 0, exp: 0, port: 0 },
    );
    return {
      group,
      count,
      qualifiedCount,
      qualifiedRate: count ? qualifiedCount / count : 0,
      mean: {
        techScore: count ? round1(sum.tech / count) : 0,
        experience: count ? round1(sum.exp / count) : 0,
        softSkill: count ? round1(sum.port / count) : 0,
      },
    };
  });
}
