import styles from "./StudyMailPanel.module.css";
import { STUDY_METRICS } from "../chapter2Data";
import { formatPct } from "../chapter2Simulation";
import type { StudyResult } from "../chapter2Simulation";

type StudyResultsPanelProps = {
  results: StudyResult[];
  fromNight: number | null;
};

function outcomeLabel(outcome: StudyResult["outcome"]) {
  if (outcome === "win") return "Aligns with queued metric";
  if (outcome === "neutral") return "Mixed / neutral";
  return "Tradeoff visible";
}

function outcomeClass(outcome: StudyResult["outcome"]) {
  if (outcome === "win") return styles.badgeWin;
  if (outcome === "neutral") return styles.badgeNeutral;
  return styles.badgeWarn;
}

export default function StudyResultsPanel({ results, fromNight }: StudyResultsPanelProps) {
  if (!results.length) {
    return (
      <section className={styles.panel} aria-label="Study results">
        <h2 className={styles.title}>Overnight results</h2>
        <p className={styles.empty}>
          {fromNight == null
            ? "No results yet — queue studies tonight and advance to receive findings tomorrow."
            : "No studies were queued last night."}
        </p>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label="Study results">
      <h2 className={styles.title}>
        Overnight results{fromNight != null ? ` (from Night ${fromNight})` : ""}
      </h2>
      <ul className={styles.list}>
        {results.map((row, i) => {
          const meta = STUDY_METRICS.find((m) => m.id === row.metricId);
          return (
            <li key={`${row.metricId}-${i}`} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.metricName}>{meta?.label ?? row.metricId}</span>
                <span className={outcomeClass(row.outcome)}>{outcomeLabel(row.outcome)}</span>
              </div>
              <div className={styles.grid}>
                <div>
                  <span className={styles.colLabel}>Black defendants (cohort)</span>
                  <span className={styles.number}>{formatPct(row.black)}</span>
                  {row.blackSecondary != null && row.secondaryLabel && (
                    <span className={styles.secondary}>
                      {row.secondaryLabel} {formatPct(row.blackSecondary)}
                    </span>
                  )}
                </div>
                <div>
                  <span className={styles.colLabel}>White defendants (cohort)</span>
                  <span className={styles.number}>{formatPct(row.white)}</span>
                  {row.whiteSecondary != null && row.secondaryLabel && (
                    <span className={styles.secondary}>
                      {row.secondaryLabel} {formatPct(row.whiteSecondary)}
                    </span>
                  )}
                </div>
              </div>
              <p className={styles.interpretation}>{row.interpretation}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
