import styles from "./EndgamePanel.module.css";
import type { FairnessDefinitionId } from "../chapter2Data";
import { ENDINGS, FAIRNESS_DEFINITIONS } from "../chapter2Data";

type EndgamePanelProps = {
  dailyScores: number[];
  aggregatedAccuracy: number;
  finalFairness: FairnessDefinitionId;
  finalBudget: number;
  onReplay: () => void;
  onNextChapter: () => void;
};

export default function EndgamePanel({
  dailyScores,
  aggregatedAccuracy,
  finalFairness,
  finalBudget,
  onReplay,
  onNextChapter,
}: EndgamePanelProps) {
  const ending = ENDINGS[finalFairness];
  const def = FAIRNESS_DEFINITIONS.find((d) => d.id === finalFairness);

  return (
    <section className={styles.panel} aria-label="Term summary">
      <h2 className={styles.title}>Three‑day term complete</h2>
      <div className={styles.scoreRow}>
        {dailyScores.map((score, i) => (
          <div key={i} className={styles.scoreBlock}>
            <h3 className={styles.subhead}>Day {i + 1} accuracy</h3>
            <p className={styles.score}>{score.toFixed(1)}</p>
          </div>
        ))}
        <div className={styles.scoreBlock}>
          <h3 className={styles.subhead}>Aggregated accuracy</h3>
          <p className={styles.score}>{aggregatedAccuracy.toFixed(1)}</p>
        </div>
      </div>
      <p className={styles.scoreNote}>
        Daily accuracy reflects each completed work night (Days 1–3). Aggregate accuracy is the running average across those nights.
      </p>
      <p className={styles.body}>
        Final budget: <strong>{Math.round(finalBudget)}</strong> units.
      </p>
      <div className={styles.legacyBlock}>
        <h3 className={styles.subhead}>Fairness metric</h3>
        <p className={styles.stance}>{def?.title}</p>
        <h3 className={styles.subhead}>{ending.headline}</h3>
        <p className={styles.body}>{ending.body}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onReplay}>
          Replay chapter
        </button>
        <button type="button" className={styles.secondary} onClick={onNextChapter}>
          Continue timeline
        </button>
      </div>
    </section>
  );
}
