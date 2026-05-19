import styles from "./EndgamePanel.module.css";
import type { FairnessDefinitionId } from "../chapter2Data";
import { ENDINGS, FAIRNESS_DEFINITIONS } from "../chapter2Data";

type EndgamePanelProps = {
  averageScore: number;
  finalFairness: FairnessDefinitionId;
  onReplay: () => void;
  onNextChapter: () => void;
};

export default function EndgamePanel({ averageScore, finalFairness, onReplay, onNextChapter }: EndgamePanelProps) {
  const ending = ENDINGS[finalFairness];
  const def = FAIRNESS_DEFINITIONS.find((d) => d.id === finalFairness);

  return (
    <section className={styles.panel} aria-label="Term summary">
      <div className={styles.scoreBlock}>
        <h2 className={styles.title}>Average session score</h2>
        <p className={styles.score}>{averageScore.toFixed(1)}</p>
        <p className={styles.scoreNote}>
          The number captures how closely your daily calls tracked the tensions implied by your <em>active</em> fairness lens — not moral worth. Different lenses score the same docket differently.
        </p>
      </div>
      <div className={styles.legacyBlock}>
        <h3 className={styles.subhead}>Recorded fairness stance</h3>
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
