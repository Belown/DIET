import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BoundaryExercise,
  BoundaryReveal,
  DayReportPanel,
  MissionPlanner,
  VerdictPanel,
} from "../Chapters/Chapter1-SamplingBias/components";
import { useInvestigationState } from "../Chapters/Chapter1-SamplingBias/hooks/useInvestigationState";
import styles from "./Demo.module.css";

type DemoView =
  | "boundary-exercise"
  | "boundary-reveal"
  | "mission-planner"
  | "day-report-1"
  | "day-report-2"
  | "day-report-3"
  | "verdict";

const TABS: { id: DemoView; label: string }[] = [
  { id: "boundary-exercise", label: "Boundary Exercise" },
  { id: "boundary-reveal", label: "Boundary Reveal" },
  { id: "mission-planner", label: "Mission Planner" },
  { id: "day-report-1", label: "Day 1 Report" },
  { id: "day-report-2", label: "Day 2 Report" },
  { id: "day-report-3", label: "Day 3 Report" },
  { id: "verdict", label: "Verdict" },
];

const pct = (v: number) => `${Math.round(v * 100)}%`;

export default function Demo() {
  const [view, setView] = useState<DemoView>("mission-planner");
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
  } = investigation;

  const stage = (() => {
    switch (view) {
      case "boundary-exercise":
        return (
          <BoundaryExercise
            boundary={demoBoundary}
            setBoundary={setDemoBoundary}
            trainingAccuracy={pct(demoTrainAcc)}
            trainingAccuracyValue={demoTrainAcc}
            onSubmit={() => setView("boundary-reveal")}
          />
        );
      case "boundary-reveal":
        return (
          <BoundaryReveal
            boundary={demoBoundary}
            spotlight
            onReturnToPage={() => setView("mission-planner")}
            realWorldAccuracy={pct(demoFullAcc)}
            trainingAccuracy={pct(demoTrainAcc)}
          />
        );
      case "mission-planner":
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
            sendDetectiveAndAdvance={() => {
              if (!currentPlans.length || dayLocked[currentDay]) return;
              sendDetective();
              const next: DemoView =
                currentDay === 0 ? "day-report-1" : currentDay === 1 ? "day-report-2" : "day-report-3";
              setView(next);
            }}
            tutorialEnabled={false}
          />
        );
      case "day-report-1":
        return (
          <DayReportPanel
            dayNumber={1}
            overallAcc={overallAcc}
            regionAccs={regionAccs}
            sampledFlags={strategy.sampledFlags}
            continueLabel="Plan day 2"
            onContinue={() => setView("mission-planner")}
            tutorialEnabled={false}
          />
        );
      case "day-report-2":
        return (
          <DayReportPanel
            dayNumber={2}
            overallAcc={overallAcc}
            regionAccs={regionAccs}
            sampledFlags={strategy.sampledFlags}
            continueLabel="Plan day 3"
            onContinue={() => setView("mission-planner")}
            tutorialEnabled={false}
          />
        );
      case "day-report-3":
        return (
          <DayReportPanel
            dayNumber={3}
            overallAcc={overallAcc}
            regionAccs={regionAccs}
            sampledFlags={strategy.sampledFlags}
            continueLabel="Review verdict"
            onContinue={() => setView("verdict")}
            tutorialEnabled={false}
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
              setView("mission-planner");
            }}
            onNextChapter={() => setView("mission-planner")}
          />
        );
      default:
        return <div className={styles.empty}>Select a screen above.</div>;
    }
  })();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.badge}>Demo</span>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${view === tab.id ? styles.tabActive : ""}`}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <span className={styles.spacer} />
        <button type="button" className={styles.action} onClick={resetInvestigation}>
          Reset state
        </button>
        <Link to="/" className={styles.backLink}>
          ← Exit demo
        </Link>
      </header>
      <main className={styles.stage}>{stage}</main>
    </div>
  );
}
