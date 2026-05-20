import styles from "../Chapter2COMPAS.module.css";
import { FAIRNESS_DEFINITIONS } from "../chapter2Data";
import type { FairnessDefinitionId } from "../chapter2Data";

type FairnessMetricSelectorProps = {
  active: FairnessDefinitionId;
  locked: boolean;
  showLockNotice: boolean;
  onSelect: (id: FairnessDefinitionId) => void;
};

export default function FairnessMetricSelector({
  active,
  locked,
  showLockNotice,
  onSelect,
}: FairnessMetricSelectorProps) {
  return (
    <section className={styles.metricSection} aria-label="Fairness metric">
      <h2 className={styles.metricHeading}>Fairness metric</h2>
      {showLockNotice && locked && (
        <p className={styles.metricNotice}>
          Metric locked for today. Your new metric takes effect tomorrow.
        </p>
      )}
      <div className={styles.choiceGrid}>
        {FAIRNESS_DEFINITIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`${styles.choice} ${active === f.id ? styles.choiceActive : ""}`}
            disabled={locked && active !== f.id}
            onClick={() => onSelect(f.id)}
            aria-pressed={active === f.id}
          >
            <span className={styles.choiceTitle}>{f.title}</span>
            <span className={styles.choiceBody}>{f.blurb}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
