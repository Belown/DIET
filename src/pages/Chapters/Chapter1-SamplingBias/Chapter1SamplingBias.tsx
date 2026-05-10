import { useState, useMemo, useEffect } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Chapter1SamplingBias.module.css";
import { BoundaryExercise, BoundaryReveal, ChoiceList, DayReportPanel, MissionPlanner, NarrativeBox, StoryIntro, VerdictPanel } from "./components";
import { DAILY_BUDGET, QUESTION_OPTIONS } from "./chapterData";
import { portraits } from "../../../assets/detective/portraits";
import { CHAPTER1_BACKGROUNDS} from "../../../assets/image/image";
import type { PassageId, Choice } from "./passages";
import { getAdaptivePassage } from "./adaptivePassages";
import { accOf, calcMissionCost, DEMO_BOUNDARY_START, DEMO_FULL, DEMO_INIT, summarizeStrategy } from "./simulation";
import type { DemoBoundary, MissionPlan, PopulationOption, QuestionKey, QuestionOption } from "./types";

type NarrativeLocation = {
  passage: PassageId;
  chunkIndex: number;
  text: string;
  current?: boolean;
  snapshot: InvestigationSnapshot;
};

type InvestigationSnapshot = {
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

const isSameNarrativeLocation = (a: NarrativeLocation, b: NarrativeLocation) =>
  a.passage === b.passage && a.chunkIndex === b.chunkIndex;

const getPortraitForText = (text: string) => {
  const lower = text.toLowerCase();

  if (lower.includes("prison") || lower.includes("convicts") || lower.includes("flags us")) return portraits.alarmed;
  if (lower.includes("collapsed") || lower.includes("wrong") || lower.includes("coin flip")) return portraits.shocked;
  if (lower.includes("blind spots") || lower.includes("gaps remain") || lower.includes("no going back")) return portraits.worried;
  if (lower.includes("did you") || lower.includes("why?") || lower.includes("what to ask")) return portraits.confused;
  if (lower.includes("suspect") || lower.includes("threat") || lower.includes("police") || lower.includes("sampling bias") || lower.includes("accuracy") || lower.includes("data")) return portraits.suspicious;
  if (lower.includes("stands down") || lower.includes("little better")) return portraits.sad;
  if (lower.includes("getting smarter") || lower.includes("sharpening") || lower.includes("made a difference")) return portraits.happy;
  if (lower.includes("pick where") || lower.includes("add more") || lower.includes("adjust") || lower.includes("plan")) return portraits.encouraging;
  if (lower.includes("build the dataset") || lower.includes("final mission") || lower.includes("close the gaps")) return portraits.confident;
  if (lower.includes("sampling bias") || lower.includes("accuracy") || lower.includes("data")) return portraits.thoughtful;
  if (lower.includes("listen carefully") || lower.includes("read the sheet") || lower.includes("you have three days")) return portraits.serious;

  return portraits.neutral;
};

const getChapterBackground = (passage: PassageId) => {
  switch (passage) {
    case "day1-plan":
    case "day2-plan":
    case "day3-plan":
      return CHAPTER1_BACKGROUNDS.cityMapTable;
    case "day1-debrief":
    case "day2-debrief":
    case "day3-debrief":
      return CHAPTER1_BACKGROUNDS.dayReport;
    case "verdict":
      return CHAPTER1_BACKGROUNDS.modelTraining;
    case "intro":
    case "day1-brief":
    case "day2-brief":
    case "day3-brief":
    default:
      return CHAPTER1_BACKGROUNDS.caseRoom;
  }
};

export default function Chapter1SamplingBias() {
  const [, setSearchParams] = useSearchParams();
  const [showStoryIntro, setShowStoryIntro] = useState(true);
  const [passage, setPassage] = useState<PassageId>("intro");
  const [chunkIndex, setChunkIndex] = useState(0);
  const [narrativeHistory, setNarrativeHistory] = useState<NarrativeLocation[]>([]);
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
  const [isBoundarySheetOpen, setIsBoundarySheetOpen] = useState(false);
  const [revealSheetMode, setRevealSheetMode] = useState<"hidden" | "spotlight">("hidden");
  const [hasSeenRevealSheet, setHasSeenRevealSheet] = useState(false);

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

  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    setShowChoices(false);
    setIsBoundarySheetOpen(false);
    setRevealSheetMode("hidden");
    if (passage !== "demo-reveal") {
      setHasSeenRevealSheet(false);
    }
  }, [passage]);

  const passageChoices = useMemo((): Choice[] => {
    return getAdaptivePassage(passage, strategy).choices ?? [];
  }, [passage, strategy]);

  const passageText = useMemo(() => {
    const currentPassage = getAdaptivePassage(passage, strategy);
    return currentPassage.chunks?.[chunkIndex] ?? currentPassage.text ?? "";
  }, [passage, chunkIndex, strategy]);
  const portraitSrc = useMemo(() => getPortraitForText(passageText), [passageText]);

  const hasMoreChunks = useMemo(() => {
    const chunks = getAdaptivePassage(passage, strategy).chunks;
    return Boolean(chunks && chunkIndex < chunks.length - 1);
  }, [passage, chunkIndex, strategy]);
  const isSheetPopupOpen = isBoundarySheetOpen || revealSheetMode === "spotlight";
  const chatboxBehavior = getAdaptivePassage(passage, strategy).chatbox;
  const shouldAutoHidePlannerNarrative = chatboxBehavior === "close" && !hasMoreChunks;
  const shouldForceOpenNarrative = chatboxBehavior === "open";
  const chapterBackground = getChapterBackground(passage);
  const phaseStyle = {
    "--chapter-bg": `url(${chapterBackground})`,
  } as CSSProperties;

  const createInvestigationSnapshot = (): InvestigationSnapshot => ({
    currentDay,
    dayPlans: dayPlans.map((plans) => plans.map((plan) => ({
      ...plan,
      zones: [...plan.zones],
      zoneDistribution: [...plan.zoneDistribution],
      questions: [...plan.questions],
      flavorLines: { ...plan.flavorLines },
    }))),
    dayLocked: [...dayLocked],
    planPopulation,
    planZones: [...planZones],
    planDistribution: [...planDistribution],
    planQuestions: [...planQuestions],
    flavorRolls: { ...flavorRolls },
    demoBoundary: { ...demoBoundary },
  });

  const restoreInvestigationSnapshot = (snapshot: InvestigationSnapshot) => {
    setCurrentDay(snapshot.currentDay);
    setDayPlans(snapshot.dayPlans.map((plans) => plans.map((plan) => ({
      ...plan,
      zones: [...plan.zones],
      zoneDistribution: [...plan.zoneDistribution],
      questions: [...plan.questions],
      flavorLines: { ...plan.flavorLines },
    }))));
    setDayLocked([...snapshot.dayLocked]);
    setPlanPopulation(snapshot.planPopulation);
    setPlanZones([...snapshot.planZones]);
    setPlanDistribution([...snapshot.planDistribution]);
    setPlanQuestions([...snapshot.planQuestions]);
    setFlavorRolls({ ...snapshot.flavorRolls });
    setDemoBoundary({ ...snapshot.demoBoundary });
  };

  const rememberCurrentChat = () => {
    const currentLocation: NarrativeLocation = {
      passage,
      chunkIndex,
      text: passageText,
      snapshot: createInvestigationSnapshot(),
    };
    setNarrativeHistory((prev) => {
      if (prev.some((item) => isSameNarrativeLocation(item, currentLocation))) return prev;
      return [...prev, currentLocation];
    });
  };

  const dialogueHistory = useMemo(() => {
    const currentLocation: NarrativeLocation = {
      passage,
      chunkIndex,
      text: passageText,
      snapshot: createInvestigationSnapshot(),
    };
    const hasCurrent = narrativeHistory.some((item) => isSameNarrativeLocation(item, currentLocation));
    const history = hasCurrent ? narrativeHistory : [...narrativeHistory, currentLocation];

    return history.map((item) => ({
      ...item,
      passageId: item.passage,
      current: isSameNarrativeLocation(item, currentLocation),
    }));
  }, [chunkIndex, narrativeHistory, passage, passageText]);

  const handleHistorySelect = (index: number) => {
    const selected = dialogueHistory[index];
    if (!selected || selected.current) return;
    restoreInvestigationSnapshot(selected.snapshot);
    setPassage(selected.passage);
    setChunkIndex(selected.chunkIndex);
    setShowChoices(false);
  };

  const handleAdvance = () => {
    if (passage === "demo-intro") {
      setIsBoundarySheetOpen(true);
      return;
    }

    if (passage === "demo-reveal" && chunkIndex > 0 && !hasSeenRevealSheet && revealSheetMode === "hidden") {
      setRevealSheetMode("spotlight");
      return;
    }

    if (hasMoreChunks) {
      rememberCurrentChat();
      setChunkIndex((idx) => idx + 1);
      return;
    }

    if (passageChoices.length === 1) {
      const c = passageChoices[0];
      c.action?.();
      rememberCurrentChat();
      setPassage(c.nextPassage);
      setChunkIndex(0);
    } else if (passageChoices.length > 1) {
      setShowChoices(true);
    }
  };

  const closeRevealSheetAndAdvance = () => {
    if (passage !== "demo-reveal") {
      setRevealSheetMode("hidden");
      return;
    }

    setRevealSheetMode("hidden");
    setHasSeenRevealSheet(true);

    if (hasMoreChunks) {
      rememberCurrentChat();
      setChunkIndex((idx) => idx + 1);
      return;
    }

    if (passageChoices.length === 1) {
      const c = passageChoices[0];
      c.action?.();
      rememberCurrentChat();
      setPassage(c.nextPassage);
      setChunkIndex(0);
    }
  };

  const submitBoundaryExercise = () => {
    if (passage !== "demo-intro") return;
    rememberCurrentChat();
    setHasSeenRevealSheet(false);
    setPassage("demo-reveal");
    setChunkIndex(0);
  };

  const handleChoice = (nextPassage: PassageId, action?: () => void) => {
    action?.();
    rememberCurrentChat();
    setPassage(nextPassage);
    setChunkIndex(0);
  };

  const sendDetectiveAndAdvance = () => {
    if (!currentPlans.length || dayLocked[currentDay]) return;
    sendDetective();
    const nextId: PassageId =
      passage === "day1-plan" ? "day1-debrief" :
      passage === "day2-plan" ? "day2-debrief" : "day3-debrief";
    rememberCurrentChat();
    setPassage(nextId);
  };

  const characterContent = (() => {
    switch (passage) {
      case "demo-intro": {
        if (!isBoundarySheetOpen) return null;

        return (
          <BoundaryExercise
            boundary={demoBoundary}
            setBoundary={setDemoBoundary}
            trainingAccuracy={pct(demoTrainAcc)}
            trainingAccuracyValue={demoTrainAcc}
            onSubmit={submitBoundaryExercise}
          />
        );
      }

      case "demo-reveal":
      {
        if (revealSheetMode === "hidden") return null;

        return (
          <BoundaryReveal
            boundary={demoBoundary}
            spotlight={revealSheetMode === "spotlight"}
            onReturnToPage={closeRevealSheetAndAdvance}
            realWorldAccuracy={pct(demoFullAcc)}
            trainingAccuracy={pct(demoTrainAcc)}
          />
        );
      }

      case "day1-plan":
      case "day2-plan":
      case "day3-plan":
        return (
          <MissionPlanner
            currentDay={currentDay}
            currentPlans={currentPlans}
            dayLocked={dayLocked}
            spentToday={spentToday}
            remainToday={remainToday}
            planPopulation={planPopulation}
            planZones={planZones}
            planQuestions={planQuestions}
            selectedQuestionInfos={selectedQuestionInfos}
            zoneCount={zoneCount}
            draftCost={draftCost}
            canAddPlan={canAddPlan}
            togglePlanZone={togglePlanZone}
            setPlanPopulation={setPlanPopulation}
            toggleQuestion={toggleQuestion}
            addPlan={addPlan}
            removePlan={removePlan}
            sendDetectiveAndAdvance={sendDetectiveAndAdvance}
          />
        );

      case "day1-debrief":
        return <DayReportPanel dayNumber={1} overallAcc={overallAcc} regionAccs={regionAccs} sampledFlags={strategy.sampledFlags} />;

      case "day2-debrief":
        return <DayReportPanel dayNumber={2} overallAcc={overallAcc} regionAccs={regionAccs} sampledFlags={strategy.sampledFlags} />;

      case "day3-debrief":
        return <DayReportPanel dayNumber={3} overallAcc={overallAcc} regionAccs={regionAccs} sampledFlags={strategy.sampledFlags} />;

      case "verdict":
        return (
          <VerdictPanel
            overallAcc={overallAcc}
            otherCityOvr={otherCityOvr}
            regionAccs={regionAccs}
            otherCityAccs={otherCityAccs}
            sampledFlags={strategy.sampledFlags}
            committedCount={strategy.committedCount}
            pct={pct}
            onRestart={() => {
              resetInvestigation();
              setPassage("day1-brief");
            }}
            onNextChapter={() => {
              setSearchParams({ chapter: "ch2" });
            }}
          />
        );

      default:
        return null;
    }
  })();

  if (showStoryIntro) {
    return (
      <div className={styles.phase}>
        <div className={styles.scene}>
          <div className={styles.sceneInner}>
            <StoryIntro
              onStart={() => setShowStoryIntro(false)}
              onSelectChapter={(chapter) => setSearchParams({ chapter })}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.phase} ${styles.phaseWithBackground}`} style={phaseStyle}>

      <div className={styles.scene}>
        <div className={styles.sceneInner}>
          {characterContent}
        </div>
      </div>

      <NarrativeBox
        text={passageText}
        portraitSrc={portraitSrc}
        history={dialogueHistory}
        onHistorySelect={handleHistorySelect}
        onAdvance={handleAdvance}
        autoCollapseOnTextComplete={shouldAutoHidePlannerNarrative}
        autoCollapseDelayMs={2000}
        disableKeyboardAdvance={isSheetPopupOpen}
        forceOpen={shouldForceOpenNarrative}
      />

      {showChoices && passageChoices.length > 1 && (
        <div className={styles.overlayChoices}>
          <ChoiceList choices={passageChoices} onSelect={handleChoice} />
        </div>
      )}
    </div>
  );
}
