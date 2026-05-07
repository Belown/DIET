import { useMemo, useState } from "react";
import Chatbox from "../../../components/Chatbox/Chatbox";
import { portraits } from "../../../assets/detective/portraits";
import ReportCard from "./components/ReportCard";
import FieryReport from "./components/FieryReport";
import StatsMonitor from "./components/StatsMonitor";
import CharacterActivity from "./components/CharacterActivity";
import FairnessPoll from "./components/FairnessPoll";
import CycleDiagram from "./components/CycleDiagram";
import styles from "./Chapter2COMPAS.module.css";

const DIALOGUES = [
  {
    text: "Let's look at the results from our COMPAS algorithm…",
    portrait: portraits.neutral,
  },
  {
    text: "Oh, our algorithm doesn't seem to be that good at predicting recidivism. I'm sure this is merely a technical problem and has no further consequences!",
    portrait: portraits.confident,
  },
  {
    text: "Wait, did we mess up? How unexpected! I'm shocked! Let's have a look at what's going on.",
    portrait: portraits.confused,
  },
  {
    text: "Remember, in our predictor, we want the recidivism rate to be the same across Black and White defendants. Specifically, exactly 60% of Black defendants classified as 'high risk' recidivate, and 60% of White defendants. How could this still be discriminating? Let me have a look at the statistics.",
    portrait: portraits.thoughtful,
  },
  {
    text: "Distribution across 'high' and 'low' risk differs across race.",
    portrait: portraits.thoughtful,
  },
  {
    text: "But 60% of Black defendants classified as 'high risk' recidivate (36), and 60% of White defendants (24).",
    portrait: portraits.thoughtful,
  },
  {
    text: "I got it! The dataset is biased towards Black defendants, even though the algorithm itself is not! This means that the False Positive and False Negative rates are very different between the Black and White populations.",
    portrait: portraits.happy,
  },
  {
    text: "Oh, I see you're confused. Let's show you through an example!",
    portrait: portraits.neutral,
  },
  {
    text: "As you saw, in this case it is impossible to satisfy both definitions of fairness — because Black defendants have a higher overall recidivism rate. In our dataset, Black defendants recidivate at a rate of 51%, compared to 39% for White defendants, similar to the national average. That is why sometimes we must choose one definition of fairness over another.",
    portrait: portraits.neutral,
  },
  {
    text: "Of course, there still remains the question of why, in our dataset, Black defendants recidivate much more often than White defendants. What we created with our initial approach is what we call 'a cycle of crime'.",
    portrait: portraits.thoughtful,
  },
];

export default function Chapter2COMPAS() {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([0]);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [fieryReady, setFieryReady] = useState(false);
  const [activityClosed, setActivityClosed] = useState(false);
  const [fairnessConfirmed, setFairnessConfirmed] = useState(false);

  const dialogue = DIALOGUES[step];
  const dialogueHistory = useMemo(() => {
    return history.map((idx) => ({
      text: DIALOGUES[idx]?.text ?? "",
      current: idx === step,
    }));
  }, [history, step]);

  const canAdvance = useMemo(() => {
    if (step === 0) return resultsLoaded;
    if (step === 1) return fieryReady;
    if (step === 7) return activityClosed;
    if (step === 8) return fairnessConfirmed;
    return true;
  }, [activityClosed, fairnessConfirmed, fieryReady, resultsLoaded, step]);

  const rememberStep = (nextStep) => {
    setHistory((prev) => (prev.includes(nextStep) ? prev : [...prev, nextStep]));
  };

  const handleAdvance = () => {
    if (!canAdvance) return;
    if (step >= DIALOGUES.length - 1) return;
    const nextStep = step + 1;
    rememberStep(nextStep);
    setStep(nextStep);
  };

  const handleHistorySelect = (index) => {
    const entry = history[index];
    if (entry === undefined) return;
    setStep(entry);
  };

  return (
    <div className={styles.phase}>
      <div className={styles.scene}>
        <div className={styles.sceneInner}>
          {!resultsLoaded && step === 0 && (
            <button type="button" className={styles.loadButton} onClick={() => setResultsLoaded(true)}>
              Load Results
            </button>
          )}

          {resultsLoaded && (
            <ReportCard />
          )}

          {step >= 1 && (
            <FieryReport onReady={() => setFieryReady(true)} />
          )}

          {step >= 3 && (
            <StatsMonitor />
          )}

          {step >= 7 && !activityClosed && (
            <CharacterActivity onClose={() => setActivityClosed(true)} />
          )}

          {step >= 8 && !fairnessConfirmed && (
            <FairnessPoll onConfirm={() => setFairnessConfirmed(true)} />
          )}

          {step >= 9 && (
            <CycleDiagram />
          )}
        </div>
      </div>

      <Chatbox
        text={dialogue.text}
        portraitSrc={dialogue.portrait}
        history={dialogueHistory}
        onHistorySelect={handleHistorySelect}
        onAdvance={handleAdvance}
        speakerName="Consultant"
      />
    </div>
  );
}
