import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import Chatbox from "../../../components/Chatbox/Chatbox";
import { portraits } from "../../../assets/detective/portraits";
import { CHAPTER1_BACKGROUNDS } from "../../../assets/image/image";
import styles from "./Chapter2COMPAS.module.css";
import {
  DAILY_OPERATING_COST,
  FAIRNESS_DEFINITIONS,
  INTRO_CHUNKS,
  STARTING_RESOURCES,
  STUDY_COST,
  STUDY_METRICS,
  TOTAL_GAME_DAYS,
  type FairnessDefinitionId,
  type StudyMetricId,
} from "./chapter2Data";
import {
  algorithmDecision,
  generatePopulation,
  scoreDay,
  studyReadout,
  summarizeDayForPlayer,
} from "./chapter2Simulation";
import type { Defendant } from "./chapter2Simulation";
import DocketBoard from "./components/DocketBoard";
import EndgamePanel from "./components/EndgamePanel";
import GameHud from "./components/GameHud";
import StudyMailPanel, { type StudyMailItem } from "./components/StudyMailPanel";
import StudyOrderForm from "./components/StudyOrderForm";

type Phase = "intro" | "fairnessPick" | "day" | "legacyPick" | "end";

type PendingStudy = { metricId: StudyMetricId; arrivesOnDay: number };

const getPortrait = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("error") || t.includes("rearrest") || t.includes("missed")) return portraits.alarmed;
  if (t.includes("trade") || t.includes("tension") || t.includes("different")) return portraits.thoughtful;
  if (t.includes("score") || t.includes("packet") || t.includes("metric")) return portraits.suspicious;
  if (t.includes("sealed") || t.includes("legacy") || t.includes("remember")) return portraits.serious;
  if (t.includes("choose") || t.includes("pick")) return portraits.encouraging;
  return portraits.neutral;
};

const summarizeMailForVoice = (mail: StudyMailItem[]) => {
  if (!mail.length) return "No delayed studies arrived overnight.";
  return mail
    .map((m) => {
      const meta = STUDY_METRICS.find((x) => x.id === m.metricId);
      const label = meta?.shortLabel ?? m.metricId;
      return `${label}: Black cohort ${Math.round(m.black * 100)}% vs White cohort ${Math.round(m.white * 100)}%`;
    })
    .join(" · ");
};

export default function Chapter2COMPAS() {
  const [, setSearchParams] = useSearchParams();
  const [phase, setPhase] = useState<Phase>("intro");
  const [introIndex, setIntroIndex] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [resources, setResources] = useState(STARTING_RESOURCES);
  const [activeFairness, setActiveFairness] = useState<FairnessDefinitionId | null>(null);
  const [finalFairness, setFinalFairness] = useState<FairnessDefinitionId | null>(null);
  const [pendingStudies, setPendingStudies] = useState<PendingStudy[]>([]);
  const [morningMail, setMorningMail] = useState<StudyMailItem[]>([]);
  const [population, setPopulation] = useState<Defendant[]>([]);
  const [decisions, setDecisions] = useState<Record<string, "detain" | "release">>({});
  const [studyPick, setStudyPick] = useState<StudyMetricId | null>(null);
  const [dayScores, setDayScores] = useState<number[]>([]);
  const [docketSealed, setDocketSealed] = useState(false);
  const [awaitingAdvance, setAwaitingAdvance] = useState(false);

  const bootstrapDay = useCallback((d: number) => {
    setPendingStudies((prev) => {
      const arrived = prev.filter((p) => p.arrivesOnDay === d);
      const stay = prev.filter((p) => p.arrivesOnDay !== d);
      setMorningMail(
        arrived.map((a) => ({
          metricId: a.metricId,
          ...studyReadout(a.metricId),
        })),
      );
      return stay;
    });

    const pop = generatePopulation(d);
    setPopulation(pop);
    const init: Record<string, "detain" | "release"> = {};
    for (const def of pop) init[def.id] = algorithmDecision(def);
    setDecisions(init);
    setDocketSealed(false);
    setAwaitingAdvance(false);
  }, []);

  const beginDayLoop = (fairness: FairnessDefinitionId) => {
    setActiveFairness(fairness);
    setPhase("day");
    setDayIndex(0);
    setDayScores([]);
    setResources(STARTING_RESOURCES);
    setStudyPick(null);
    bootstrapDay(0);
  };

  const narrativeText = useMemo(() => {
    switch (phase) {
      case "intro":
        return INTRO_CHUNKS[introIndex] ?? "";
      case "fairnessPick":
        return "Select the fairness lens you want to begin with. You can change it anytime from the HUD — but the city will record whichever lens you confirm at the end of the term.";
      case "day": {
        const mailVoice = summarizeMailForVoice(morningMail);
        return `Day ${dayIndex + 1} of ${TOTAL_GAME_DAYS}. ${mailVoice} The docket is live: follow the instrument, override where you must, then seal the day when you are ready.`;
      }
      case "legacyPick":
        return "The rotating assignment ends. Which fairness stance should the courthouse print in the annual report? This choice steers the epilogue — not your numeric score.";
      case "end":
        return "The file is sealed. Read the office’s memory of your term below.";
      default:
        return "";
    }
  }, [phase, introIndex, dayIndex, morningMail]);

  const narrativePassageId = `${phase}-${phase === "intro" ? introIndex : phase === "day" ? dayIndex : "x"}`;

  const portraitSrc = useMemo(() => getPortrait(narrativeText), [narrativeText]);

  const chapterBackground = useMemo(() => {
    if (phase === "day") return CHAPTER1_BACKGROUNDS.cityMapTable;
    if (phase === "end" || phase === "legacyPick") return CHAPTER1_BACKGROUNDS.modelTraining;
    return CHAPTER1_BACKGROUNDS.caseRoom;
  }, [phase]);

  const phaseStyle = {
    "--chapter-bg": `url(${chapterBackground})`,
  } as CSSProperties;

  const dialogueHistory = useMemo(
    () => [{ text: narrativeText, passageId: narrativePassageId, current: true }],
    [narrativeText, narrativePassageId],
  );

  const handleIntroAdvance = () => {
    if (introIndex < INTRO_CHUNKS.length - 1) {
      setIntroIndex((i) => i + 1);
    } else {
      setPhase("fairnessPick");
    }
  };

  const handleChatAdvance = () => {
    if (phase === "intro") handleIntroAdvance();
  };

  const applyAlgorithmAll = () => {
    setDecisions((prev) => {
      const next = { ...prev };
      for (const d of population) next[d.id] = algorithmDecision(d);
      return next;
    });
  };

  const sealCost =
    DAILY_OPERATING_COST + (studyPick && dayIndex < TOTAL_GAME_DAYS - 1 ? STUDY_COST : 0);
  const canSealDay = resources >= sealCost && activeFairness && population.length > 0;

  const sealDay = () => {
    if (!activeFairness || !population.length) return;
    if (docketSealed) return;
    if (resources < sealCost) return;

    const score = scoreDay(population, decisions, activeFairness);
    setDayScores((prev) => [...prev, score]);

    const studyCostToday = studyPick ? STUDY_COST : 0;
    setResources((r) => r - DAILY_OPERATING_COST - studyCostToday);

    if (studyPick && dayIndex < TOTAL_GAME_DAYS - 1) {
      setPendingStudies((ps) => [...ps, { metricId: studyPick, arrivesOnDay: dayIndex + 1 }]);
    }
    setStudyPick(null);
    setDocketSealed(true);
    setAwaitingAdvance(true);
  };

  const continueAfterSeal = () => {
    if (!docketSealed) return;
    if (dayIndex >= TOTAL_GAME_DAYS - 1) {
      setPhase("legacyPick");
      setAwaitingAdvance(false);
      return;
    }
    const next = dayIndex + 1;
    setDayIndex(next);
    bootstrapDay(next);
  };

  const averageScore = dayScores.length ? dayScores.reduce((a, b) => a + b, 0) / dayScores.length : 0;

  const canAffordStudy = resources >= DAILY_OPERATING_COST + STUDY_COST;

  const daySummary = useMemo(() => {
    if (!docketSealed || !population.length) return null;
    return summarizeDayForPlayer(population, decisions);
  }, [docketSealed, population, decisions]);

  const centerPanel =
    phase === "day" && activeFairness ? (
      <>
        <GameHud
          dayIndex={dayIndex}
          resources={resources}
          activeFairness={activeFairness}
          onFairnessChange={setActiveFairness}
          studyPick={studyPick}
          studyCost={STUDY_COST}
          dailyCost={DAILY_OPERATING_COST}
          awaitingAdvance={awaitingAdvance}
          pendingStudyCount={pendingStudies.length}
        />
        <StudyMailPanel items={morningMail} />
        <DocketBoard
          population={population}
          decisions={decisions}
          onDecisionChange={(id, v) => {
            if (docketSealed) return;
            setDecisions((prev) => ({ ...prev, [id]: v }));
          }}
          onApplyAlgorithm={applyAlgorithmAll}
          sealed={docketSealed}
          disabled={awaitingAdvance}
        />
        <StudyOrderForm
          value={studyPick}
          onChange={setStudyPick}
          canAfford={canAffordStudy}
          disabled={docketSealed || awaitingAdvance}
          isLastDay={dayIndex === TOTAL_GAME_DAYS - 1}
        />
        {daySummary && (
          <div className={styles.daySummary} role="status">
            <span>
              Wrongful detentions today: <strong>{daySummary.wrongDetentions}</strong>
            </span>
            <span>
              Missed rearrests (released): <strong>{daySummary.missedRisk}</strong>
            </span>
            <span>
              Today’s lens score: <strong>{dayScores[dayScores.length - 1]?.toFixed(1) ?? "—"}</strong>
            </span>
          </div>
        )}
        <div className={styles.dayActions}>
          {!docketSealed && (
            <button type="button" className={styles.primaryBtn} onClick={sealDay} disabled={!canSealDay}>
              Seal today’s docket
            </button>
          )}
          {!docketSealed && !canSealDay && (
            <span className={styles.warn}>Not enough resources to cover today’s overhead and any queued study.</span>
          )}
          {docketSealed && awaitingAdvance && (
            <button type="button" className={styles.primaryBtn} onClick={continueAfterSeal}>
              {dayIndex >= TOTAL_GAME_DAYS - 1 ? "Proceed to legacy choice" : "Open next docket"}
            </button>
          )}
        </div>
      </>
    ) : null;

  const endPanel =
    phase === "end" && finalFairness ? (
      <EndgamePanel
        averageScore={averageScore}
        finalFairness={finalFairness}
        onReplay={() => {
          setPhase("intro");
          setIntroIndex(0);
          setDayIndex(0);
          setActiveFairness(null);
          setFinalFairness(null);
          setPendingStudies([]);
          setMorningMail([]);
          setPopulation([]);
          setDecisions({});
          setStudyPick(null);
          setDayScores([]);
          setDocketSealed(false);
          setAwaitingAdvance(false);
          setResources(STARTING_RESOURCES);
        }}
        onNextChapter={() => setSearchParams({ chapter: "ch3" })}
      />
    ) : null;

  return (
    <div className={`${styles.phase} ${styles.phaseWithBackground}`} style={phaseStyle}>
      <div className={styles.scene}>
        <div className={styles.sceneInner}>
          {centerPanel}
          {endPanel}
        </div>
      </div>

      {phase === "fairnessPick" && (
        <div className={styles.overlayChoices} role="dialog" aria-label="Choose fairness lens">
          <div className={styles.choiceCard}>
            <p className={styles.choiceLead}>Starting fairness lens</p>
            <div className={styles.choiceGrid}>
              {FAIRNESS_DEFINITIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={styles.choice}
                  onClick={() => beginDayLoop(f.id)}
                >
                  <span className={styles.choiceTitle}>{f.title}</span>
                  <span className={styles.choiceBody}>{f.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "legacyPick" && (
        <div className={styles.overlayChoices} role="dialog" aria-label="Final fairness stance">
          <div className={styles.choiceCard}>
            <p className={styles.choiceLead}>Which stance goes on the record?</p>
            <div className={styles.choiceGrid}>
              {FAIRNESS_DEFINITIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={styles.choice}
                  onClick={() => {
                    setFinalFairness(f.id);
                    setPhase("end");
                  }}
                >
                  <span className={styles.choiceTitle}>{f.title}</span>
                  <span className={styles.choiceBody}>{f.scoringHint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Chatbox
        text={narrativeText}
        portraitSrc={portraitSrc}
        history={dialogueHistory}
        onAdvance={handleChatAdvance}
        speakerName="Pretrial clerk"
        disableKeyboardAdvance={phase !== "intro"}
        disablePreviousNavigation
      />
    </div>
  );
}
