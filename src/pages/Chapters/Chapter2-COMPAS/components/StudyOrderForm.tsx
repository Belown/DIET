import styles from "./StudyOrderForm.module.css";
import { STUDY_COST, STUDY_METRICS, studySignalLabel } from "../chapter2Data";
import type { StudyMetricId } from "../chapter2Data";

type StudyOrderFormProps = {
  value: StudyMetricId | null;
  onChange: (id: StudyMetricId | null) => void;
  canAfford: boolean;
  disabled: boolean;
  isLastDay: boolean;
};

export default function StudyOrderForm({ value, onChange, canAfford, disabled, isLastDay }: StudyOrderFormProps) {
  if (isLastDay) {
    return (
      <section className={styles.panel} aria-label="Studies">
        <h2 className={styles.title}>Analyst queue</h2>
        <p className={styles.note}>Final session: studies ordered now would arrive after your term ends — queue is closed.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label="Studies">
      <h2 className={styles.title}>Commission a delayed study</h2>
      <p className={styles.note}>
        Results arrive tomorrow morning with light sampling noise. Costs <strong>{STUDY_COST}</strong> resources today. Different metrics
        age differently on short dockets — choose where you want clarity.
      </p>
      <div className={styles.row}>
        <select
          className={styles.select}
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v ? (v as StudyMetricId) : null);
          }}
          disabled={disabled}
          aria-label="Select metric to study"
        >
          <option value="">No study today — conserve budget</option>
          {STUDY_METRICS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.shortLabel} — {studySignalLabel(m.signal)}
            </option>
          ))}
        </select>
      </div>
      {!canAfford && value && <p className={styles.warn}>Insufficient resources for this study.</p>}
    </section>
  );
}
