import styles from "./StudyMailPanel.module.css";
import { STUDY_METRICS, studySignalLabel } from "../chapter2Data";
import { formatPct } from "../chapter2Simulation";
import type { StudyMetricId } from "../chapter2Data";

export type StudyMailItem = {
  metricId: StudyMetricId;
  black: number;
  white: number;
};

type StudyMailPanelProps = {
  items: StudyMailItem[];
};

export default function StudyMailPanel({ items }: StudyMailPanelProps) {
  if (!items.length) {
    return (
      <section className={styles.panel} aria-label="Study results">
        <h2 className={styles.title}>Overnight analyst packet</h2>
        <p className={styles.empty}>No delayed studies arrived this morning.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label="Study results">
      <h2 className={styles.title}>Overnight analyst packet</h2>
      <ul className={styles.list}>
        {items.map((row) => {
          const meta = STUDY_METRICS.find((m) => m.id === row.metricId);
          return (
            <li key={row.metricId} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.metricName}>{meta?.label ?? row.metricId}</span>
                {meta && <span className={styles.badge}>{studySignalLabel(meta.signal)}</span>}
              </div>
              <div className={styles.grid}>
                <div>
                  <span className={styles.colLabel}>Black defendants (cohort)</span>
                  <span className={styles.number}>{formatPct(row.black)}</span>
                </div>
                <div>
                  <span className={styles.colLabel}>White defendants (cohort)</span>
                  <span className={styles.number}>{formatPct(row.white)}</span>
                </div>
              </div>
              {meta && <p className={styles.note}>{meta.description}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
