import { useMemo, useState } from "react";
import { DAILY_BUDGET, QUESTION_OPTIONS } from "../chapterData";
import {
  accOf,
  calcMissionCost,
  DEMO_BOUNDARY_START,
  DEMO_FULL,
  DEMO_INIT,
  summarizeStrategy,
} from "../simulation";
import type {
  DemoBoundary,
  MissionPlan,
  PopulationOption,
  QuestionKey,
  QuestionOption,
} from "../types";

export type InvestigationSnapshot = {
  currentDay: number;
  dayPlans: MissionPlan[][];
  dayLocked: boolean[];
  planPopulation: PopulationOption;
  planZones: boolean[];
  planDistribution: number[];
  planQuestions: QuestionKey[];
  flavorRolls: Record<QuestionKey, number>;
  demoBoundary: DemoBoundary;
};

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

export function useInvestigationState() {
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

  const demoTrainAcc = useMemo(() => accOf(DEMO_INIT, demoBoundary), [demoBoundary]);
  const demoFullAcc = useMemo(() => accOf(DEMO_FULL, demoBoundary), [demoBoundary]);

  const selectedQuestionInfos = useMemo(() => {
    return planQuestions
      .map((key) => {
        const q = QUESTION_OPTIONS.find((x) => x.key === key);
        if (!q) return null;
        return { ...q, line: q.flavor[flavorRolls[q.key] % q.flavor.length] };
      })
      .filter(Boolean) as Array<QuestionOption & { line: string }>;
  }, [planQuestions, flavorRolls]);

  const togglePlanZone = (i: number, v: boolean) =>
    setPlanZones((prev) => {
      const next = [...prev];
      next[i] = v;
      setPlanDistribution(() => buildEqualDistribution(next));
      return next;
    });

  const cycleFlavor = (key: QuestionKey) =>
    setFlavorRolls((prev) => ({ ...prev, [key]: prev[key] + 1 }));

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
    }
  };

  const resetInvestigation = () => {
    setCurrentDay(0);
    setDayPlans([[], [], []]);
    setDayLocked([false, false, false]);
    setPlanZones([true, false, false, false]);
    setPlanDistribution([1, 0, 0, 0]);
    setPlanPopulation(100);
    setPlanQuestions([]);
  };

  const createSnapshot = (): InvestigationSnapshot => ({
    currentDay,
    dayPlans: dayPlans.map((plans) =>
      plans.map((plan) => ({
        ...plan,
        zones: [...plan.zones],
        zoneDistribution: [...plan.zoneDistribution],
        questions: [...plan.questions],
        flavorLines: { ...plan.flavorLines },
      })),
    ),
    dayLocked: [...dayLocked],
    planPopulation,
    planZones: [...planZones],
    planDistribution: [...planDistribution],
    planQuestions: [...planQuestions],
    flavorRolls: { ...flavorRolls },
    demoBoundary: { ...demoBoundary },
  });

  const restoreSnapshot = (snapshot: InvestigationSnapshot) => {
    setCurrentDay(snapshot.currentDay);
    setDayPlans(
      snapshot.dayPlans.map((plans) =>
        plans.map((plan) => ({
          ...plan,
          zones: [...plan.zones],
          zoneDistribution: [...plan.zoneDistribution],
          questions: [...plan.questions],
          flavorLines: { ...plan.flavorLines },
        })),
      ),
    );
    setDayLocked([...snapshot.dayLocked]);
    setPlanPopulation(snapshot.planPopulation);
    setPlanZones([...snapshot.planZones]);
    setPlanDistribution([...snapshot.planDistribution]);
    setPlanQuestions([...snapshot.planQuestions]);
    setFlavorRolls({ ...snapshot.flavorRolls });
    setDemoBoundary({ ...snapshot.demoBoundary });
  };

  return {
    currentDay,
    dayPlans,
    dayLocked,
    planPopulation,
    planZones,
    planDistribution,
    planQuestions,
    flavorRolls,
    demoBoundary,
    setDemoBoundary,
    strategy,
    regionAccs,
    otherCityAccs,
    overallAcc,
    otherCityOvr,
    currentPlans,
    spentToday,
    remainToday,
    zoneCount,
    draftCost,
    canAddPlan,
    demoTrainAcc,
    demoFullAcc,
    selectedQuestionInfos,
    togglePlanZone,
    setPlanPopulation,
    toggleQuestion,
    addPlan,
    removePlan,
    sendDetective,
    resetInvestigation,
    createSnapshot,
    restoreSnapshot,
  };
}
