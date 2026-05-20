import styles from "./EndgamePanel.module.css";

type DaySummaryPanelProps = {
  currentDay: number;
  dailyAccuracy: number | null;
  aggregateAccuracy: number | null;
  queuedTonight: number;
  queueCost: number;
};

export default function DaySummaryPanel({
  currentDay,
  dailyAccuracy,
  aggregateAccuracy,
  queuedTonight,
  queueCost,
}: DaySummaryPanelProps) {
  if (currentDay === 0) return null;

  return (
    <section className={styles.panel} aria-label="Session summary">
      <h2 className={styles.title}>Session summary</h2>
      <div className={styles.scoreRow}>
        <div className={styles.scoreBlock}>
          <h3 className={styles.subhead}>Daily accuracy</h3>
          <p className={styles.score}>{dailyAccuracy != null ? `${dailyAccuracy.toFixed(1)}%` : "—"}</p>
        </div>
        <div className={styles.scoreBlock}>
          <h3 className={styles.subhead}>Aggregate accuracy</h3>
          <p className={styles.score}>{aggregateAccuracy != null ? `${aggregateAccuracy.toFixed(1)}%` : "—"}</p>
        </div>
      </div>
      {currentDay < 3 && (
        <p className={styles.scoreNote}>
          Tonight&apos;s queue: {queuedTonight} studies ({queueCost} credits) — charged when you advance.
        </p>
      )}
    </section>
  );
}
