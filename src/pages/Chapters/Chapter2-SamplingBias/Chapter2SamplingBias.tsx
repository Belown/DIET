import { useState, useMemo } from "react";
import styles from "./Chapter2SamplingBias.module.css";
import detectiveImg from "./Detective.png";

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────
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

// ─── Region definitions ───────────────────────────────────────────────────────
type RId = 0 | 1 | 2 | 3;

const REGIONS = [
  { id: 0 as RId, label: "Uptown",       desc: "Wealthy, privileged area",            xMean: 28, yMean: 25, std: 8, suspRate: 0.12, color: "#494fdf" },
  { id: 1 as RId, label: "Downtown",     desc: "Busy commercial area",              xMean: 22, yMean: 20, std: 7, suspRate: 0.10, color: "#7c3aed" },
  { id: 2 as RId, label: "Factory Zone", desc: "Working-class area",                 xMean: 68, yMean: 70, std: 9, suspRate: 0.13, color: "#e61e49" },
  { id: 3 as RId, label: "The Slums",    desc: "Unpredictable, low-income area",     xMean: 62, yMean: 66, std: 9, suspRate: 0.11, color: "#e8a308" },
] as const;

type DPt = { id: number; x: number; y: number; region: RId; suspicious: boolean };

type DemoBoundary = { slope: number; intercept: number };
const DEMO_BOUNDARY_START: DemoBoundary = { slope: 0.9, intercept: 6 };
const isFlagged = (p: DPt, b: DemoBoundary) => p.y >= b.slope * p.x + b.intercept;

function accOf(pts: DPt[], b: DemoBoundary): number {
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
const DEMO_INIT = [
  ...genLabeledCluster(0, 10, SEED, 18, 18, 4, false),
  ...genLabeledCluster(0, 10, SEED + 1, 42, 46, 4, true),
];
const DEMO_FULL = [
  ...genLabeledCluster(0, 175, SEED + 2, 18, 18, 5, false),
  ...genLabeledCluster(0, 75, SEED + 3, 44, 48, 5, true),

  ...genLabeledCluster(1, 180, SEED + 4, 28, 24, 6, false),
  ...genLabeledCluster(1, 70, SEED + 5, 52, 54, 6, true),

  ...genLabeledCluster(2, 220, SEED + 6, 74, 76, 6, false),
  ...genLabeledCluster(2, 30, SEED + 7, 84, 87, 5, true),

  ...genLabeledCluster(3, 185, SEED + 8, 62, 66, 7, false),
  ...genLabeledCluster(3, 65, SEED + 9, 80, 83, 6, true),
];

// ─── Investigation game mode ─────────────────────────────────────────────────
type PopulationOption = 100 | 500 | 1000;
type QuestionKey = "daily-routine" | "phone-model" | "past-police-stops";

type QuestionOption = {
  key: QuestionKey;
  label: string;
  tactic: string;
  why: string;
  cost: number;
  flavor: string[];
};

type MissionPlan = {
  id: string;
  population: PopulationOption;
  zones: boolean[];
  zoneDistribution: number[];
  questions: QuestionKey[];
  weight: number;
  cost: number;
  flavorLines: Record<QuestionKey, string>;
};

const DAILY_BUDGET = 100;
const POP_OPTIONS: PopulationOption[] = [100, 500, 1000];
const POP_COST: Record<PopulationOption, number> = { 100: 15, 500: 40, 1000: 80 };
const ZONE_COST = 5;

const QUESTION_OPTIONS: QuestionOption[] = [
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

function calcMissionCost(pop: PopulationOption, zoneCount: number, questions: QuestionKey[]): number {
  const questionCost = questions.reduce((sum, key) => {
    return sum + (QUESTION_OPTIONS.find((q) => q.key === key)?.cost ?? 0);
  }, 0);
  return POP_COST[pop] + zoneCount * ZONE_COST + questionCost;
}

function summarizeStrategy(plansByDay: MissionPlan[][], dayLocked: boolean[]) {
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
  const usefulBonus = Math.min(0.12, usefulSignal / 7000);
  const noisePenalty = Math.min(0.04, noiseSignal / 9000);
  const biasBoostSeen = Math.min(0.05, biasSignal / 9000);
  const biasPenaltyUnseen = Math.min(0.15, biasSignal / 5000);

  const regionAccs = zoneSamples.map((s, i) => {
    const coverage = Math.min(1, s / 900);
    let acc = 0.38 + 0.36 * coverage + 0.08 * diversity + usefulBonus - noisePenalty;
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
  };
}

// ─── SVG Scatter ─────────────────────────────────────────────────────────────
const SW = 460, SH = 300;
const PL = 44, PR = 12, PT = 16, PB = 40;
const IW = SW - PL - PR, IH = SH - PT - PB;
const px = (v: number) => PL + (v / 100) * IW;
const py = (v: number) => PT + (1 - v / 100) * IH;

function Scatter({ pts, ariaLabel, boundary }: { pts: DPt[]; ariaLabel: string; boundary: DemoBoundary }) {
  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} className={styles.scatter} role="img" aria-label={ariaLabel}>
      <line x1={PL} y1={PT + IH} x2={PL + IW} y2={PT + IH} stroke="#c9c9cd" strokeWidth="1.5" />
      <line x1={PL} y1={PT}      x2={PL}       y2={PT + IH} stroke="#c9c9cd" strokeWidth="1.5" />

      {[20, 40, 60, 80].map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={PT}      x2={px(v)}   y2={PT + IH} stroke="#ebebef" strokeWidth="1" />
          <line x1={PL}    y1={py(v)}   x2={PL + IW} y2={py(v)}   stroke="#ebebef" strokeWidth="1" />
          <text x={px(v)} y={PT + IH + 14} textAnchor="middle" fontSize="10" fill="#8d969e">{v}</text>
          <text x={PL - 5} y={py(v) + 3}  textAnchor="end"    fontSize="10" fill="#8d969e">{v}</text>
        </g>
      ))}

      <text x={PL + IW / 2} y={SH - 3} textAnchor="middle" fontSize="11" fill="#8d969e">
        Night Activity
      </text>
      <text x={11} y={PT + IH / 2} textAnchor="middle" fontSize="11" fill="#8d969e"
        transform={`rotate(-90 11 ${PT + IH / 2})`}>
        Group Size
      </text>

      {pts.map((p) => {
        const wrong = isFlagged(p, boundary) !== p.suspicious;
        return (
          <circle key={p.id}
            cx={px(p.x)} cy={py(p.y)}
            r={wrong ? 5 : 4}
            fill={p.suspicious ? "#dc2626" : "#16a34a"}
            opacity={0.82}
            stroke={wrong ? "#191c1f" : "none"}
            strokeWidth={wrong ? 1.8 : 0}
          />
        );
      })}

      <line
        x1={px(0)}   y1={py(boundary.intercept)}
        x2={px(100)} y2={py(boundary.slope * 100 + boundary.intercept)}
        stroke="#191c1f" strokeWidth="2.5" strokeDasharray="8 5" strokeLinecap="round"
      />

      <text x={PL + IW * 0.80} y={PT + 18} textAnchor="middle" fontSize="10" fill="#191c1f" opacity="0.25" fontWeight="500">flagged</text>
      <text x={PL + IW * 0.12} y={PT + IH - 6} textAnchor="middle" fontSize="10" fill="#191c1f" opacity="0.25" fontWeight="500">clear</text>
    </svg>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
type Step = "story" | "demo" | "investigate" | "results";

const STORY_LINES: string[] = [
  "Listen carefully. We don't have much time.",
  "Ten years from now, a machine convicts us.",
  "An AI risk-scoring system. It flags us as a suspect based on our daily patterns — night activity, group size, where we walk.",
  "The score was wrong. But it sent us to prison anyway.",
  "I traveled back to find out why. The answer wasn't in the algorithm — it was in the data it learned from.",
  "Three things destroyed it. Too few samples. Whole districts ignored. Features that didn't matter.",
  "You have three days. Three chances to fix what they got wrong.",
  "Pick where to investigate. Who to question. What to ask them.",
  "Build the dataset that should have been collected. Maybe this time, the model gets us right.",
];

export default function Chapter2SamplingBias() {
  const [step,     setStep]     = useState<Step>("story");
  const [storyRevealed, setStoryRevealed] = useState<number>(1);
  const [revealed, setRevealed] = useState(false);
  const [demoBoundary, setDemoBoundary] = useState<DemoBoundary>(DEMO_BOUNDARY_START);
  const [currentDay, setCurrentDay] = useState(0);
  const [dayPlans, setDayPlans] = useState<MissionPlan[][]>([[], [], []]);
  const [dayLocked, setDayLocked] = useState<boolean[]>([false, false, false]);
  const [planPopulation, setPlanPopulation] = useState<PopulationOption>(100);
  const [planZones, setPlanZones] = useState<boolean[]>([true, false, false, false]);
  const [planDistribution, setPlanDistribution] = useState<number[]>([1, 0, 0, 0]);
  const [planQuestions, setPlanQuestions] = useState<QuestionKey[]>([]);
  const [flavorRolls, setFlavorRolls] = useState<Record<QuestionKey, number>>({
    "daily-routine": 0,
    "phone-model": 0,
    "past-police-stops": 0,
  });

  const strategy = useMemo(() => summarizeStrategy(dayPlans, dayLocked), [dayPlans, dayLocked]);
  const regionAccs = strategy.regionAccs;
  const otherCityAccs = strategy.otherCityAccs;
  const overallAcc = useMemo(() => regionAccs.reduce((s, a) => s + a, 0) / 4, [regionAccs]);
  const otherCityOvr = useMemo(() => otherCityAccs.reduce((s, a) => s + a, 0) / 4, [otherCityAccs]);
  const currentPlans = dayPlans[currentDay];
  const spentToday = currentPlans.reduce((s, p) => s + p.cost, 0);
  const remainToday = DAILY_BUDGET - spentToday;
  const zoneCount = planZones.filter(Boolean).length;
  const draftCost = zoneCount ? calcMissionCost(planPopulation, zoneCount, planQuestions) : 0;
  const canAddPlan = !dayLocked[currentDay] && zoneCount > 0 && draftCost <= remainToday;

  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const demoTrainAcc = useMemo(() => accOf(DEMO_INIT, demoBoundary), [demoBoundary]);
  const demoFullAcc = useMemo(() => accOf(DEMO_FULL, demoBoundary), [demoBoundary]);

  const togglePlanZone = (i: number, v: boolean) =>
    setPlanZones((prev) => {
      const next = [...prev];
      next[i] = v;
      setPlanDistribution(() => buildEqualDistribution(next));
      return next;
    });

  const toPoints = (fraction: number) => Math.max(0, Math.min(10, Math.round(fraction * 10)));

  const buildEqualDistribution = (zones: boolean[]) => {
    const next = [0, 0, 0, 0];
    const active = zones.map((on, i) => (on ? i : -1)).filter((idx) => idx >= 0);
    if (!active.length) return next;
    const base = Math.floor(10 / active.length);
    let remainder = 10 - base * active.length;
    active.forEach((idx) => {
      next[idx] = (base + (remainder > 0 ? 1 : 0)) / 10;
      if (remainder > 0) remainder -= 1;
    });
    return next;
  };

  const rebalanceWithTarget = (zones: boolean[], current: number[], targetIdx: number, targetPct: number) => {
    const next = [0, 0, 0, 0];
    const active = zones.map((on, i) => (on ? i : -1)).filter((idx) => idx >= 0);
    if (!active.length) return next;
    if (!active.includes(targetIdx)) return buildEqualDistribution(zones);
    if (active.length === 1) {
      next[targetIdx] = 1;
      return next;
    }

    const targetPoints = Math.max(0, Math.min(10, Math.round(targetPct / 10)));
    const remainingPoints = 10 - targetPoints;
    const points = [0, 0, 0, 0];
    active.forEach((idx) => { points[idx] = toPoints(current[idx]); });
    points[targetIdx] = targetPoints;

    const others = active.filter((idx) => idx !== targetIdx);
    if (remainingPoints <= 0) {
      others.forEach((idx) => { points[idx] = 0; });
    } else {
      const otherSum = others.reduce((s, idx) => s + points[idx], 0);
      if (otherSum <= 0) {
        const base = Math.floor(remainingPoints / others.length);
        let rem = remainingPoints - base * others.length;
        others.forEach((idx) => {
          points[idx] = base + (rem > 0 ? 1 : 0);
          if (rem > 0) rem -= 1;
        });
      } else {
        const scaled = others.map((idx) => {
          const value = (points[idx] / otherSum) * remainingPoints;
          return { idx, floor: Math.floor(value), frac: value - Math.floor(value) };
        });
        let assigned = 0;
        scaled.forEach((s) => {
          points[s.idx] = s.floor;
          assigned += s.floor;
        });
        let rem = remainingPoints - assigned;
        scaled.sort((a, b) => b.frac - a.frac);
        for (let i = 0; i < scaled.length && rem > 0; i += 1) {
          points[scaled[i].idx] += 1;
          rem -= 1;
        }
      }
    }

    active.forEach((idx) => {
      next[idx] = points[idx] / 10;
    });
    return next;
  };

  const setDistributionForZone = (zoneIdx: number, value: number) => {
    const snapped = Math.max(0, Math.min(100, Math.round(value / 10) * 10));
    setPlanDistribution((prev) => rebalanceWithTarget(planZones, prev, zoneIdx, snapped));
  };

  const toggleQuestion = (key: QuestionKey, checked: boolean) => {
    setPlanQuestions((prev) => {
      if (checked) {
        if (prev.includes(key)) return prev;
        return [...prev, key];
      }
      return prev.filter((k) => k !== key);
    });
    if (checked) cycleFlavor(key);
  };

  const cycleFlavor = (key: QuestionKey) =>
    setFlavorRolls((prev) => ({
      ...prev,
      [key]: prev[key] + 1,
    }));

  const addPlan = () => {
    if (!canAddPlan) return;
    const flavorLines = planQuestions.reduce((acc, key) => {
      const q = QUESTION_OPTIONS.find((x) => x.key === key);
      if (q) acc[key] = q.flavor[flavorRolls[q.key] % q.flavor.length];
      return acc;
    }, {} as Record<QuestionKey, string>);
    const newPlan: MissionPlan = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      population: planPopulation,
      zones: [...planZones],
      zoneDistribution: [...planDistribution],
      questions: [...planQuestions],
      weight: 1,
      cost: draftCost,
      flavorLines,
    };
    setDayPlans((prev) => {
      const next = [...prev];
      next[currentDay] = [...next[currentDay], newPlan];
      return next;
    });
  };

  const removePlan = (id: string) => {
    if (dayLocked[currentDay]) return;
    setDayPlans((prev) => {
      const next = [...prev];
      next[currentDay] = next[currentDay].filter((p) => p.id !== id);
      return next;
    });
  };

  const sendDetective = () => {
    if (!currentPlans.length || dayLocked[currentDay]) return;
    setDayLocked((prev) => {
      const next = [...prev];
      next[currentDay] = true;
      return next;
    });
    if (currentDay < 2) {
      setCurrentDay((d) => d + 1);
      setPlanZones([true, false, false, false]);
      setPlanDistribution([1, 0, 0, 0]);
      setPlanPopulation(100);
      setPlanQuestions([]);
    } else {
      setStep("results");
    }
  };

  const selectedQuestionInfos = useMemo(() => {
    return planQuestions.map((key) => {
      const q = QUESTION_OPTIONS.find((x) => x.key === key);
      if (!q) return null;
      return {
        ...q,
        line: q.flavor[flavorRolls[q.key] % q.flavor.length],
      };
    }).filter(Boolean) as Array<QuestionOption & { line: string }>;
  }, [planQuestions, flavorRolls]);

  return (
    <div className={styles.phase}>
      <div className={styles.stepTabs}>
        {(["story", "demo", "investigate", "results"] as Step[]).map((s, i) => (
          <button key={s} type="button"
            className={`${styles.stepTab} ${step === s ? styles.stepTabActive : ""}`}
            onClick={() => setStep(s)}>
            {["01 · Background", "02 · Demo", "03 · Investigate", "04 · Results"][i]}
          </button>
        ))}
      </div>

      {/* ═══ 01 · STORY TALK ════════════════════════════════════════════════ */}
      {step === "story" && (
        <>
          <div className={styles.storyHeader}>
            <p className={styles.panelEyebrow}>Chapter 2 · Sampling Bias</p>
            <h2 className={styles.h2}>A message from your future self.</h2>
          </div>

          <div className={styles.storyChat}>
            {STORY_LINES.slice(0, storyRevealed).map((line, i) => (
              <div
                key={i}
                className={styles.storyMessage}
                style={{ animationDelay: `${i === storyRevealed - 1 ? 0 : 0}s` }}
              >
                <img src={detectiveImg} alt="" className={styles.storyAvatar} />
                <div className={styles.storyBubble}>
                  <span className={styles.storySpeaker}>Future You</span>
                  <p className={styles.storyText}>{line}</p>
                </div>
              </div>
            ))}
            {storyRevealed < STORY_LINES.length && (
              <div className={styles.storyTyping} aria-hidden>
                <span /><span /><span />
              </div>
            )}
          </div>

          {storyRevealed < STORY_LINES.length ? (
            <button
              type="button"
              className={styles.storyAdvance}
              onClick={() => setStoryRevealed((n) => Math.min(STORY_LINES.length, n + 1))}
            >
              ▾ Continue
            </button>
          ) : (
            <div className={styles.continueRow}>
              <p className={styles.continueHint}>Begin the investigation.</p>
              <button type="button" className={styles.continueBtn} onClick={() => setStep("demo")}>
                Continue →
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══ 02 · DEMO ══════════════════════════════════════════════════════ */}
      {step === "demo" && (
        <>
          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Initial view · Region 1 only · {DEMO_INIT.length} points</p>
            <h2 className={styles.h2}>Draw a boundary that looks perfect.</h2>
            <p className={styles.panelBody}>
              X-axis is Night Activity, Y-axis is Group Size. Move the line to separate Safe (green)
              from Threat (red). Black rings are mistakes.
            </p>
          </div>

          <div className={styles.plotCard} style={{ maxWidth: 560, marginInline: "auto" }}>
            <div className={styles.scatterHeader}>
              <span className={styles.scatterStat}>
                Training accuracy: <strong>{pct(demoTrainAcc)}</strong>
              </span>
            </div>
            <Scatter pts={DEMO_INIT} ariaLabel={`${DEMO_INIT.length} training points from Region 1`} boundary={demoBoundary} />
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>Slope</span>
              <input
                type="range"
                min={-1.5}
                max={1.5}
                step={0.01}
                value={demoBoundary.slope}
                onChange={(e) => setDemoBoundary((b) => ({ ...b, slope: parseFloat(e.target.value) }))}
                className={styles.sliderInput}
              />
              <span className={styles.sliderValue}>{demoBoundary.slope.toFixed(2)}</span>
            </div>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>Shift</span>
              <input
                type="range"
                min={-40}
                max={100}
                step={1}
                value={demoBoundary.intercept}
                onChange={(e) => setDemoBoundary((b) => ({ ...b, intercept: parseFloat(e.target.value) }))}
                className={styles.sliderInput}
              />
              <span className={styles.sliderValue}>{demoBoundary.intercept.toFixed(0)}</span>
            </div>
            <div className={styles.scatterLegend}>
              <span className={styles.scatterLegendItem}>
                <span className={styles.scatterSwatch} style={{ background: "#16a34a" }} />
                Safe
              </span>
              <span className={styles.scatterLegendItem}>
                <span className={styles.scatterSwatch} style={{ background: "#dc2626" }} />
                Threat
              </span>
              <span className={styles.scatterLegendItem}>
                <span className={styles.scatterSwatchOutline} />
                Misclassified
              </span>
            </div>
          </div>

          {!revealed ? (
            <div className={styles.unlockCard}>
              <div className={styles.unlockText}>
                <p className={styles.unlockTitle}>Ready to deploy?</p>
                <p className={styles.unlockBody}>
                  Apply your current line to all four regions (1000 points).
                </p>
              </div>
              <button type="button" className={styles.unlockBtn} onClick={() => setRevealed(true)}>
                Deploy to Full City (1000 Points) →
              </button>
            </div>
          ) : (
            <>
              <div className={styles.panel}>
                <p className={styles.panelEyebrow}>The reveal · {DEMO_FULL.length} points across 4 regions</p>
                <h2 className={styles.h2}>Same line. Real-world failure.</h2>
                <p className={styles.panelBody}>
                  Region 3 contains many safe night-shift workers in the high-activity zone. Your line,
                  tuned on Region 1, wrongly flags many of them as threats.
                </p>
              </div>

              <div className={styles.plotCard} style={{ maxWidth: 560, marginInline: "auto" }}>
                <div className={styles.scatterHeader}>
                  <span className={styles.scatterStat}>
                    Real-world accuracy: <strong className={styles.scatterStatBad}>{pct(demoFullAcc)}</strong>
                    <span className={styles.scatterStatDrop}>&nbsp;↓ from {pct(demoTrainAcc)}</span>
                  </span>
                </div>
                <Scatter pts={DEMO_FULL} ariaLabel={`${DEMO_FULL.length} points from all 4 regions`} boundary={demoBoundary} />
                <div className={styles.scatterLegend}>
                  <span className={styles.scatterLegendItem}>
                    <span className={styles.scatterSwatch} style={{ background: "#16a34a" }} />
                    Safe
                  </span>
                  <span className={styles.scatterLegendItem}>
                    <span className={styles.scatterSwatch} style={{ background: "#dc2626" }} />
                    Threat
                  </span>
                  <span className={styles.scatterLegendItem}>
                    <span className={styles.scatterSwatchOutline} />
                    Misclassified
                  </span>
                </div>
              </div>

              <div className={styles.continueRow}>
                <p className={styles.continueHint}>Now control the investigation yourself.</p>
                <button type="button" className={styles.continueBtn} onClick={() => setStep("investigate")}>
                  Continue →
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ 03 · INVESTIGATE ═══════════════════════════════════════════════ */}
      {step === "investigate" && (
        <>
          <div className={styles.detectiveIntro}>
            <p className={styles.lede}>
              You have 3 investigation days. Each day has a budget of {DAILY_BUDGET}. Plan missions, send the detective,
              and adjust tomorrow based on model feedback.
            </p>
            <img src={detectiveImg} alt="Detective" className={styles.detectiveImage} />
          </div>

          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Day {currentDay + 1} / 3 · Budget Control</p>
            <h2 className={styles.h2}>Design today’s data collection strategy</h2>
            <p className={styles.panelBody}>
              Fixed records always available: Night Activity (X-axis) and Group Size (Y-axis).
              You control where to search, how many people to sample, and optional extra questions.
            </p>
            <p className={styles.panelBody}>
              Spent: <strong>{spentToday}</strong> / {DAILY_BUDGET} · Remaining: <strong>{remainToday}</strong>
            </p>
          </div>

          {/* Choice 1 */}
          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Choice 1 · Which zones to search?</p>
            <div className={styles.regionGrid}>
              {REGIONS.map((r, i) => (
                <label key={r.id}
                  className={`${styles.regionCard} ${planZones[i] ? styles.regionCardOn : ""}`}>
                  <input type="checkbox" checked={planZones[i]}
                    onChange={(e) => togglePlanZone(i, e.target.checked)}
                    disabled={dayLocked[currentDay]} />
                  <span className={styles.regionDot} style={{ background: r.color }} />
                  <span className={styles.regionName}>{r.label}</span>
                  <span className={styles.regionDesc}>{r.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Choice 2 */}
          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Choice 2 · Amount — how many per district?</p>
            <div className={styles.sampleRow}>
              <span className={styles.sampleLbl}>{planPopulation} residents</span>
              <input type="range" min={0} max={2} step={1}
                value={POP_OPTIONS.indexOf(planPopulation)}
                onChange={(e) => {
                  const idx = Math.max(0, Math.min(2, parseInt(e.target.value, 10) || 0));
                  setPlanPopulation(POP_OPTIONS[idx]);
                }}
                className={styles.sliderInput}
                disabled={dayLocked[currentDay]} />
              <span className={styles.sampleHint}>
                {planPopulation === 100 ? "Small sweep" : planPopulation === 500 ? "Focused campaign" : "Mass operation"}
              </span>
            </div>

            {zoneCount > 1 && (
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                <p className={styles.panelBody}>Distribution across selected zones:</p>
                {REGIONS.map((r, i) => planZones[i] ? (
                  <div key={r.id} className={styles.sliderRow}>
                    <span className={styles.sliderLabel}>{r.label}</span>
                    <input type="range" min={0} max={100} step={10}
                      value={Math.round(planDistribution[i] * 100)}
                      onChange={(e) => setDistributionForZone(i, parseInt(e.target.value, 10) || 0)}
                      className={styles.sliderInput}
                      disabled={dayLocked[currentDay]} />
                    <span className={styles.sliderValue}>{Math.round(planDistribution[i] * 100)}%</span>
                  </div>
                ) : null)}
              </div>
            )}

          </div>

          {/* Choice 3 */}
          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Choice 3 · Additional question to ask</p>
            <p className={styles.panelBody}>You can select multiple extra questions. Each one adds cost and affects signal quality.</p>
            <div className={styles.featureGrid}>
              {QUESTION_OPTIONS.map((f) => (
                <label key={f.key}
                  className={`${styles.featureChip} ${planQuestions.includes(f.key) ? styles.featureChipOn : ""}`}>
                  <input type="checkbox" checked={planQuestions.includes(f.key)}
                    onChange={(e) => toggleQuestion(f.key, e.target.checked)}
                    disabled={dayLocked[currentDay]} />
                  {f.label} (+{f.cost})
                </label>
              ))}
            </div>

            <div className={styles.featureIntelPanel}>
              {selectedQuestionInfos.length === 0 ? (
                <p className={styles.featureIntelEmpty}>No extra question selected. Mission uses only fixed government records.</p>
              ) : (
                selectedQuestionInfos.map((q) => (
                  <div className={styles.featureIntelCard} key={q.key}>
                    <p className={styles.featureIntelTitle}>{q.label}</p>
                    <p className={styles.featureIntelLine}><strong>The Tactic:</strong> {q.tactic}</p>
                    <p className={styles.featureIntelLine}><strong>Why it works:</strong> {q.why}</p>
                    <p className={styles.featureIntelFlavor}>"{q.line}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Mission Draft</p>
            <p className={styles.panelBody}>
              Draft cost: <strong>{draftCost}</strong> · Remaining after add: <strong>{remainToday - draftCost}</strong>
            </p>
            <div className={styles.continueRow}>
              <p className={styles.continueHint}>You can add multiple plans in one day until budget is used.</p>
              <button type="button" className={styles.continueBtn} onClick={addPlan} disabled={!canAddPlan}>
                Add Mission
              </button>
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {currentPlans.length === 0 ? (
                <p className={styles.featureIntelEmpty}>No plans yet for Day {currentDay + 1}.</p>
              ) : (
                currentPlans.map((p) => (
                  <div key={p.id} className={styles.featureIntelCard}>
                    <p className={styles.featureIntelTitle}>
                      {p.population} pop · {p.zones.filter(Boolean).length} zone(s) · cost {p.cost}
                    </p>
                    <p className={styles.featureIntelLine}>
                      Zones: {REGIONS.filter((_, i) => p.zones[i]).map((z) => z.label).join(", ")}
                    </p>
                    <p className={styles.featureIntelLine}>
                      Distribution: {REGIONS.filter((_, i) => p.zones[i]).map((z) => {
                        const i = REGIONS.findIndex((r) => r.id === z.id);
                        return `${z.label} ${Math.round(p.zoneDistribution[i] * 100)}%`;
                      }).join(" · ")}
                    </p>
                    <p className={styles.featureIntelLine}>
                      Extra questions: {p.questions.length ? p.questions.map((k) => QUESTION_OPTIONS.find((q) => q.key === k)?.label).join("; ") : "None"}
                    </p>
                    {p.questions.map((k) => (
                      <p key={`${p.id}-${k}`} className={styles.featureIntelFlavor}>
                        "{p.flavorLines[k]}"
                      </p>
                    ))}
                    {!dayLocked[currentDay] && (
                      <button type="button" className={styles.unlockBtn} onClick={() => removePlan(p.id)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.continueRow}>
            <p className={styles.continueHint}>
              Day {currentDay + 1}: {currentPlans.length} mission(s) · spent {spentToday}/{DAILY_BUDGET}
            </p>
            <button type="button" className={styles.continueBtn}
              disabled={currentPlans.length === 0 || dayLocked[currentDay]}
              onClick={sendDetective}>
              {currentDay < 2 ? `Send Detective · Start Day ${currentDay + 2} →` : "Send Detective · Train Model →"}
            </button>
          </div>
        </>
      )}

      {/* ═══ 04 · RESULTS ═══════════════════════════════════════════════════ */}
      {step === "results" && (
        <>
          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Your city · overall {pct(overallAcc)}</p>
            <h2 className={styles.h2}>Accuracy by district</h2>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {REGIONS.map((r, i) => (
                <div key={r.id} style={{ color: "var(--rui-slate)", fontSize: 14 }}>
                  <strong style={{ color: r.color }}>{r.label}</strong>: {pct(regionAccs[i])}
                  {!strategy.sampledFlags[i] ? " (not sampled in 3-day plan)" : ""}
                </div>
              ))}
            </div>
            <p className={styles.deployNote}>Committed detective missions: {strategy.committedCount}</p>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Deployed to a neighboring city · overall {pct(otherCityOvr)}</p>
            <h2 className={styles.h2}>Does the model travel?</h2>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {REGIONS.map((r, i) => (
                <div key={r.id} style={{ color: "var(--rui-slate)", fontSize: 14 }}>
                  <strong style={{ color: r.color }}>{r.label}</strong>: {pct(otherCityAccs[i])}
                </div>
              ))}
            </div>
            <p className={styles.deployNote}>
              {otherCityOvr >= 0.70
                ? "Transfers reasonably — but ongoing monitoring is still essential."
                : "Breaks in the new city. A model tuned on one city needs retraining before deployment elsewhere."}
            </p>
          </div>

          {/* TODO: personal verdict — tie back to the player's conviction */}

          <div className={styles.continueRow}>
            <p className={styles.continueHint}>Try different choices.</p>
            <button type="button" className={styles.continueBtn}
              onClick={() => setStep("investigate")}>
              ← Reinvestigate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
