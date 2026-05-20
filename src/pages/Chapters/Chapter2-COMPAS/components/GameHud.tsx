import styles from "./GameHud.module.css";
import { MAX_CURRENT_DAY } from "../chapter2Data";

type GameHudProps = {
  currentDay: number;
  budget: number;
  dailyAccuracy: number | null;
  aggregateAccuracy: number | null;
};

export default function GameHud({ currentDay, budget, dailyAccuracy, aggregateAccuracy }: GameHudProps) {
  return (
    <header className={styles.hud} aria-label="Court status">
      <div className={styles.hudBlock}>
        <span className={styles.kicker}>Session</span>
        <span className={styles.value}>
          Day {currentDay} / {MAX_CURRENT_DAY}
        </span>
      </div>
      <div className={styles.hudBlock}>
        <span className={styles.kicker}>Budget</span>
        <span className={styles.value}>{Math.round(budget)} credits</span>
      </div>
      <div className={styles.hudBlock}>
        <span className={styles.kicker}>Daily accuracy</span>
        <span className={styles.value}>
          {dailyAccuracy != null ? `${dailyAccuracy.toFixed(1)}%` : "—"}
        </span>
      </div>
      <div className={styles.hudBlock}>
        <span className={styles.kicker}>Aggregate accuracy</span>
        <span className={styles.value}>
          {aggregateAccuracy != null ? `${aggregateAccuracy.toFixed(1)}%` : "—"}
        </span>
      </div>
    </header>
  );
}
