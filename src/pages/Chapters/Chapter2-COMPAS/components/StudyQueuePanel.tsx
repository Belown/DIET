import styles from "./StudyOrderForm.module.css";
import { STUDY_METRICS } from "../chapter2Data";
import type { StudyMetricId } from "../chapter2Data";

type StudyQueuePanelProps = {
  pendingQueue: StudyMetricId[];
  budget: number;
  disabled: boolean;
  onToggle: (metricId: StudyMetricId) => void;
};

export default function StudyQueuePanel({ pendingQueue, budget, disabled, onToggle }: StudyQueuePanelProps) {
  const queueCost = pendingQueue.reduce((sum, id) => {
    const m = STUDY_METRICS.find((x) => x.id === id);
    return sum + (m?.cost ?? 0);
  }, 0);
  const remainingAfter = budget - queueCost;
  const togglesDisabled = disabled || budget <= 0;

  return (
    <section className={styles.panel} aria-label="Queue studies for tomorrow">
      <h2 className={styles.title}>Queue studies for tomorrow</h2>
      <p className={styles.note}>
        Select studies to run overnight. Each study can be queued at most once per night. Costs are deducted when you advance.
      </p>
      {budget <= 0 && (
        <p className={styles.warn} role="status">
          Insufficient budget — you cannot queue new studies. Advance when ready.
        </p>
      )}
      <div className={styles.cardGrid}>
        {STUDY_METRICS.map((m) => {
          const selected = pendingQueue.includes(m.id);
          const wouldAfford = budget >= queueCost + (selected ? 0 : m.cost);
          const toggleDisabled = togglesDisabled || (!selected && !wouldAfford);

          return (
            <article key={m.id} className={`${styles.studyCard} ${selected ? styles.studyCardSelected : ""}`}>
              <label className={styles.studyLabel}>
                <input
                  type="checkbox"
                  className={styles.studyCheck}
                  checked={selected}
                  disabled={toggleDisabled}
                  onChange={() => onToggle(m.id)}
                />
                <span className={styles.cardTitle}>{m.shortLabel}</span>
              </label>
              <p className={styles.cardDesc}>{m.description}</p>
              <p className={styles.cardCost}>
                Cost: <strong>{m.cost}</strong> credits
              </p>
            </article>
          );
        })}
      </div>
      <div className={styles.costPreview} aria-live="polite">
        <p>
          Tomorrow&apos;s studies: <strong>{pendingQueue.length}</strong> selected
        </p>
        <p>
          Total cost: <strong>{queueCost}</strong> credits
        </p>
        <p>
          Credits remaining after advancing: <strong>{remainingAfter}</strong> credits
        </p>
        {remainingAfter < 0 && (
          <p className={styles.warn}>Not enough budget for this queue. Remove a study or advance with a smaller selection.</p>
        )}
      </div>
    </section>
  );
}
