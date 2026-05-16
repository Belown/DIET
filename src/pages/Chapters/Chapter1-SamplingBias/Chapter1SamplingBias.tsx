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

const upsertNarrativeLocation = (history: NarrativeLocation[], location: NarrativeLocation) => {
  const existingIndex = history.findIndex((item) => isSameNarrativeLocation(item, location));
  if (existingIndex === -1) return [...history, location];

  return history.map((item, index) => (index === existingIndex ? location : item));
};

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

type ImportantInstructionTarget = {
  id: "boundary-exercise" | "boundary-reveal" | "day1-plan" | "day2-plan" | "day3-plan";
  passage: PassageId;
  chunkIndex?: number;
};

type Chapter1SamplingBiasProps = {
  isActive?: boolean;
  onTutorialOverlayOpenChange?: (open: boolean) => void;
  tutorialDebugEnabled?: boolean;
};

export default function Chapter1SamplingBias({
  isActive = true,
  onTutorialOverlayOpenChange,
  tutorialDebugEnabled = false,
}: Chapter1SamplingBiasProps) {
  const [, setSearchParams] = useSearchParams();
  const investigation = useInvestigationState();
  const {
    currentDay,
    dayPlans,
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
  const [isTutorialOverlayOpen, setIsTutorialOverlayOpen] = useState(false);
  const [hasCompletedMissionTutorial, setHasCompletedMissionTutorial] = useState(false);
  const [hasCompletedDayReportTutorial, setHasCompletedDayReportTutorial] = useState(false);
  const [chatboxReopenSignal, setChatboxReopenSignal] = useState(0);
  const [sceneAdvanceSignal, setSceneAdvanceSignal] = useState(0);
  const [isNarrativeCollapsed, setIsNarrativeCollapsed] = useState(false);

  useEffect(() => {
    onTutorialOverlayOpenChange?.(isActive && isTutorialOverlayOpen);

    return () => onTutorialOverlayOpenChange?.(false);
  }, [isActive, isTutorialOverlayOpen, onTutorialOverlayOpenChange]);

  const pct = (v: number) => `${Math.round(v * 100)}%`;

  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    setShowChoices(false);
    setIsNarrativeCollapsed(false);
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
  const isSheetPopupOpen = passage === "demo-exercise" || passage === "demo-reveal-sheet";
  const chatboxBehavior = getAdaptivePassage(passage, strategy).chatbox;
  const shouldAutoHidePlannerNarrative = chatboxBehavior === "close" && !hasMoreChunks;
  const shouldForceOpenNarrative = chatboxBehavior === "open";
  const isDayReportPassage = passage === "day1-debrief" || passage === "day2-debrief" || passage === "day3-debrief";
  const shouldExpectMissionTutorial =
    passage === "day1-plan" && !hasCompletedMissionTutorial && currentDay === 0 && !dayLocked[currentDay];
  const shouldProxySceneClicksToNarrative =
    !isTutorialOverlayOpen &&
    !isNarrativeCollapsed &&
    !shouldExpectMissionTutorial;
  const chapterBackground = getChapterBackground(passage);
  const phaseStyle = {
    "--chapter-bg": chapterBackground ? `url(${chapterBackground})` : "none",
  } as CSSProperties;

  const createCurrentNarrativeLocation = (): NarrativeLocation => ({
    passage,
    chunkIndex,
    text: passageText,
    snapshot: createSnapshot(),
  });

  const rememberCurrentChat = () => {
    const currentLocation = createCurrentNarrativeLocation();
    setNarrativeHistory((prev) => upsertNarrativeLocation(prev, currentLocation));
  };

  const nextImportantInstruction = useMemo((): ImportantInstructionTarget | null => {
    switch (passage) {
      case "intro":
        return {
          id: "boundary-exercise",
          passage: "demo-exercise",
        };
      case "demo-intro":
        return {
          id: "boundary-exercise",
          passage: "demo-exercise",
        };
      case "demo-reveal":
        return {
          id: "boundary-reveal",
          passage: "demo-reveal-sheet",
        };
      case "demo-reveal-analysis":
        return {
          id: "day1-plan",
          passage: "day1-plan",
        };
      case "day1-brief":
        return {
          id: "day1-plan",
          passage: "day1-plan",
        };
      case "day2-brief":
        return {
          id: "day2-plan",
          passage: "day2-plan",
        };
      case "day3-brief":
        return {
          id: "day3-plan",
          passage: "day3-plan",
        };
      default:
        return null;
    }
  }, [passage]);

  const skipToImportantInstruction = () => {
    if (!nextImportantInstruction) return;

    rememberCurrentChat();
    setShowChoices(false);

    setPassage(nextImportantInstruction.passage);
    setChunkIndex(nextImportantInstruction.chunkIndex ?? 0);
  };

  const currentLocation = createCurrentNarrativeLocation();
  const historyWithCurrent = upsertNarrativeLocation(narrativeHistory, currentLocation);

  const dialogueHistory = historyWithCurrent.map((item) => ({
    ...item,
    passageId: item.passage,
    current: isSameNarrativeLocation(item, currentLocation),
  }));

  const handleHistorySelect = (index: number) => {
    const selected = dialogueHistory[index];
    if (!selected || selected.current) return;
    setNarrativeHistory((prev) => upsertNarrativeLocation(prev, currentLocation));
    restoreSnapshot(selected.snapshot);
    setPassage(selected.passage);
    setChunkIndex(selected.chunkIndex);
    setShowChoices(false);
  };

  const handleAdvance = () => {
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
    if (passage !== "demo-reveal-sheet") return;
    rememberCurrentChat();
    setPassage("demo-reveal-analysis");
    setChunkIndex(0);
  };

  const submitBoundaryExercise = () => {
    if (passage !== "demo-exercise") return;
    rememberCurrentChat();
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
    if (passage === "day3-debrief" && choice.nextPassage === "verdict") {
      setChatboxReopenSignal((signal) => signal + 1);
    }
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
      case "demo-exercise": {
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

      case "demo-reveal-sheet":
      {
        return (
          <BoundaryReveal
            boundary={demoBoundary}
            spotlight
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
            dayPlans={dayPlans}
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
            tutorialDebugEnabled={tutorialDebugEnabled}
            onTutorialOpenChange={setIsTutorialOverlayOpen}
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
            tutorialDebugEnabled={tutorialDebugEnabled}
            onTutorialOpenChange={setIsTutorialOverlayOpen}
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
            tutorialDebugEnabled={tutorialDebugEnabled}
            onTutorialOpenChange={setIsTutorialOverlayOpen}
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
            tutorialDebugEnabled={tutorialDebugEnabled}
            onTutorialOpenChange={setIsTutorialOverlayOpen}
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
      className={`${styles.phase} ${styles.phaseWithBackground} ${isDayReportPassage ? styles.phaseDayReport : ""} ${isTutorialOverlayOpen ? styles.phaseTutorialActive : ""}`}
      style={phaseStyle}
    >

      <div className={styles.scene}>
        <div className={styles.sceneInner}>
          {characterContent}
        </div>
      </div>

      {shouldProxySceneClicksToNarrative && (
        <button
          type="button"
          className={styles.narrativeClickProxy}
          onClick={() => setSceneAdvanceSignal((signal) => signal + 1)}
          aria-label="Continue narrative"
        />
      )}

      {!isTutorialOverlayOpen && !shouldExpectMissionTutorial && (
        <NarrativeBox
          text={passageText}
          portraitSrc={portraitSrc}
          history={dialogueHistory}
          onHistorySelect={handleHistorySelect}
          onAdvance={isDayReportPassage ? undefined : handleAdvance}
          onSkipToImportantInstruction={nextImportantInstruction ? skipToImportantInstruction : undefined}
          externalAdvanceSignal={sceneAdvanceSignal}
          onCollapsedChange={setIsNarrativeCollapsed}
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
