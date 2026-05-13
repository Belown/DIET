import { useState, useMemo, useEffect } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Chapter1SamplingBias.module.css";
import { BoundaryExercise, BoundaryReveal, ChoiceList, DayReportPanel, MissionPlanner, NarrativeBox, VerdictPanel } from "./components";
import { portraits } from "../../../assets/detective/portraits";
import { CHAPTER1_BACKGROUNDS } from "../../../assets/image/image";
import type { PassageId, Choice } from "./staticPassages";
import { getAdaptivePassage } from "./adaptivePassages";
import { useInvestigationState, type InvestigationSnapshot } from "./hooks/useInvestigationState";

type NarrativeLocation = {
  passage: PassageId;
  chunkIndex: number;
  text: string;
  current?: boolean;
  snapshot: InvestigationSnapshot;
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

const getChapterBackground = (passage: PassageId): string | null => {
  switch (passage) {
    case "day1-plan":
    case "day2-plan":
    case "day3-plan":
    case "verdict":
      return null;
    case "day1-debrief":
    case "day2-debrief":
    case "day3-debrief":
      return null;
    case "intro":
    case "day1-brief":
    case "day2-brief":
    case "day3-brief":
    default:
      return CHAPTER1_BACKGROUNDS.caseRoom;
  }
};

type Chapter1SamplingBiasProps = {
  onMissionTutorialOpenChange?: (open: boolean) => void;
};

export default function Chapter1SamplingBias({ onMissionTutorialOpenChange }: Chapter1SamplingBiasProps) {
  const [, setSearchParams] = useSearchParams();
  const investigation = useInvestigationState();
  const {
    currentDay,
    dayLocked,
    planPopulation,
    planZones,
    planQuestions,
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
    demoBoundary,
    setDemoBoundary,
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
  } = investigation;
  const [passage, setPassage] = useState<PassageId>("intro");
  const [chunkIndex, setChunkIndex] = useState(0);
  const [narrativeHistory, setNarrativeHistory] = useState<NarrativeLocation[]>([]);
  const [isBoundarySheetOpen, setIsBoundarySheetOpen] = useState(false);
  const [revealSheetMode, setRevealSheetMode] = useState<"hidden" | "spotlight">("hidden");
  const [hasSeenRevealSheet, setHasSeenRevealSheet] = useState(false);
  const [isMissionTutorialOpen, setIsMissionTutorialOpen] = useState(false);
  const [hasCompletedMissionTutorial, setHasCompletedMissionTutorial] = useState(false);
  const [hasCompletedDayReportTutorial, setHasCompletedDayReportTutorial] = useState(false);
  const [chatboxReopenSignal, setChatboxReopenSignal] = useState(0);

  useEffect(() => {
    onMissionTutorialOpenChange?.(isMissionTutorialOpen);

    return () => onMissionTutorialOpenChange?.(false);
  }, [isMissionTutorialOpen, onMissionTutorialOpenChange]);

  const pct = (v: number) => `${Math.round(v * 100)}%`;

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
  const isDayReportPassage = passage === "day1-debrief" || passage === "day2-debrief" || passage === "day3-debrief";
  const chapterBackground = getChapterBackground(passage);
  const phaseStyle = {
    "--chapter-bg": chapterBackground ? `url(${chapterBackground})` : "none",
  } as CSSProperties;

  const rememberCurrentChat = () => {
    const currentLocation: NarrativeLocation = {
      passage,
      chunkIndex,
      text: passageText,
      snapshot: createSnapshot(),
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
      snapshot: createSnapshot(),
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
    restoreSnapshot(selected.snapshot);
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

  const handleReportContinue = () => {
    if (passageChoices.length !== 1) return;

    const choice = passageChoices[0];
    choice.action?.();
    rememberCurrentChat();
    setPassage(choice.nextPassage);
    setChunkIndex(0);
    setShowChoices(false);
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
            tutorialEnabled={!hasCompletedMissionTutorial}
            onTutorialOpenChange={setIsMissionTutorialOpen}
            onTutorialDismiss={() => setHasCompletedMissionTutorial(true)}
          />
        );

      case "day1-debrief":
        return (
          <DayReportPanel
            dayNumber={1}
            overallAcc={overallAcc}
            regionAccs={regionAccs}
            sampledFlags={strategy.sampledFlags}
            continueLabel={passageChoices[0]?.label}
            onContinue={handleReportContinue}
            tutorialEnabled={!hasCompletedDayReportTutorial}
            onTutorialOpenChange={setIsMissionTutorialOpen}
            onTutorialDismiss={() => setHasCompletedDayReportTutorial(true)}
          />
        );

      case "day2-debrief":
        return (
          <DayReportPanel
            dayNumber={2}
            overallAcc={overallAcc}
            regionAccs={regionAccs}
            sampledFlags={strategy.sampledFlags}
            continueLabel={passageChoices[0]?.label}
            onContinue={handleReportContinue}
          />
        );

      case "day3-debrief":
        return (
          <DayReportPanel
            dayNumber={3}
            overallAcc={overallAcc}
            regionAccs={regionAccs}
            sampledFlags={strategy.sampledFlags}
            continueLabel={passageChoices[0]?.label}
            onContinue={handleReportContinue}
          />
        );

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
              setChunkIndex(0);
              setShowChoices(false);
              setChatboxReopenSignal((signal) => signal + 1);
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

  return (
    <div
      className={`${styles.phase} ${styles.phaseWithBackground} ${isMissionTutorialOpen ? styles.phaseTutorialActive : ""}`}
      style={phaseStyle}
    >

      <div className={styles.scene}>
        <div className={styles.sceneInner}>
          {characterContent}
        </div>
      </div>

      {!isMissionTutorialOpen && (
        <NarrativeBox
          text={passageText}
          portraitSrc={portraitSrc}
          history={dialogueHistory}
          onHistorySelect={handleHistorySelect}
          onAdvance={isDayReportPassage ? undefined : handleAdvance}
          autoCollapseOnTextComplete={shouldAutoHidePlannerNarrative}
          disableKeyboardAdvance={isSheetPopupOpen}
          forceOpen={shouldForceOpenNarrative}
          reopenSignal={chatboxReopenSignal}
        />
      )}

      {showChoices && passageChoices.length > 1 && (
        <div className={styles.overlayChoices}>
          <ChoiceList choices={passageChoices} onSelect={handleChoice} />
        </div>
      )}
    </div>
  );
}
