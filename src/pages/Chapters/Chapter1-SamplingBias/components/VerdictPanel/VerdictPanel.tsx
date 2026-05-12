import { useEffect, useMemo, useState } from "react";
import { REGIONS } from "../../chapterData";
import styles from "./VerdictPanel.module.css";
import shared from "../../../../../styles/shared.module.css";

type VerdictPanelProps = {
  overallAcc: number;
  otherCityOvr: number;
  regionAccs: number[];
  otherCityAccs: number[];
  sampledFlags: boolean[];
  committedCount: number;
  pct: (value: number) => string;
  onRestart: () => void;
  onNextChapter: () => void;
};

type AccBarProps = {
  label: string;
  color: string;
  value: number;
  note?: string;
};

function AccBar({ label, color, value, note }: AccBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.round(value * 100)), 80);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={styles.accRow}>
      <div className={styles.accMeta}>
        <span className={styles.accLabel} style={{ color }}>{label}</span>
        <span className={styles.accValue}>{width}%</span>
      </div>
      <div className={styles.accTrack}>
        <div className={styles.accFill} style={{ "--bar-width": `${width}%`, background: color } as React.CSSProperties} />
      </div>
      {note ? <span className={styles.accNote}>{note}</span> : null}
    </div>
  );
}

export default function VerdictPanel({
  overallAcc,
  otherCityOvr,
  regionAccs,
  otherCityAccs,
  sampledFlags,
  committedCount,
  pct,
  onRestart,
  onNextChapter,
}: VerdictPanelProps) {
  const riskLevel = overallAcc >= 0.8 ? "Low Risk" : overallAcc >= 0.6 ? "Medium Risk" : "High Risk";

  const narrativeInsights = useMemo(() => {
    const lowestIdx = regionAccs.reduce((minI, acc, i, arr) => (acc < arr[minI] ? i : minI), 0);
    const unsampled = REGIONS.filter((_, i) => !sampledFlags[i]).map((r) => r.label);

    const insights: string[] = [];
    insights.push(`Most vulnerable district: ${REGIONS[lowestIdx].label} at ${pct(regionAccs[lowestIdx])}.`);
    insights.push(`Model transfer dropped from ${pct(overallAcc)} to ${pct(otherCityOvr)} in neighboring city deployment.`);
    if (unsampled.length) insights.push(`Unvisited districts in field plan: ${unsampled.join(", ")}.`);
    insights.push("Evidence shows data collection choices directly shaped model behavior.");
    return insights;
  }, [otherCityOvr, overallAcc, pct, regionAccs, sampledFlags]);

  const suggestedActions = useMemo(() => {
    const actions: string[] = [];
    if (sampledFlags.filter(Boolean).length < 4) actions.push("Run another investigation with full 4-district coverage.");
    if (otherCityOvr < 0.7) actions.push("Add transfer validation before deployment to a new city.");
    if (overallAcc < 0.75) actions.push("Increase useful context signals and avoid noisy question choices.");
    if (!actions.length) actions.push("Keep this strategy as baseline and monitor drift each retraining cycle.");
    actions.push("Audit who gets misclassified, not just the average score.");
    return actions;
  }, [otherCityOvr, overallAcc, sampledFlags]);

  return (
    <>
      <section className={styles.panel}>
        <p className={styles.panelEyebrow}>Case Closure · Day 3 Final Report</p>
        <h2 className={styles.h2}>AI Justice Investigation Outcome</h2>
        <p className={styles.panelBody}>Three field days are complete. This report summarizes model performance, transfer risk, and what to do next.</p>
        <div className={styles.summaryRow}>
          <span className={styles.scorePill}>Overall <strong>{pct(overallAcc)}</strong></span>
          <span className={styles.scorePill}>Neighbor City <strong>{pct(otherCityOvr)}</strong></span>
          <span className={styles.scorePill}>Risk <strong>{riskLevel}</strong></span>
        </div>
      </section>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <p className={styles.panelEyebrow}>Region-by-Region Results</p>
          <div className={styles.accGrid}>
            {REGIONS.map((r, i) => (
              <AccBar
                key={`local-${r.id}`}
                label={`${r.label} · New Eden`}
                color={r.color}
                value={regionAccs[i]}
                note={!sampledFlags[i] ? "not sampled in 3-day plan" : undefined}
              />
            ))}
          </div>
          <p className={styles.deployNote}>Committed detective missions: {committedCount}</p>
        </section>

        <section className={styles.panel}>
          <p className={styles.panelEyebrow}>Does the Model Travel?</p>
          <div className={styles.accGrid}>
            {REGIONS.map((r, i) => (
              <AccBar key={`transfer-${r.id}`} label={`${r.label} · Neighbor City`} color={r.color} value={otherCityAccs[i]} />
            ))}
          </div>
          <p className={styles.deployNote}>
            {otherCityOvr >= 0.7
              ? "Transfer quality is acceptable, but ongoing audits are still required."
              : "Transfer quality is weak. Retraining with local data is required before deployment."}
          </p>
        </section>
      </div>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <p className={styles.panelEyebrow}>Narrative Insights</p>
          <ul className={styles.list}>
            {narrativeInsights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <p className={styles.panelEyebrow}>Suggested Next Actions</p>
          <ul className={styles.list}>
            {suggestedActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className={styles.continueRow}>
        <p className={shared.continueHint}>Case closed for this timeline. Reopen with a different strategy?</p>
        <div className={styles.actionRow}>
          <button type="button" className={shared.continueBtn} onClick={onRestart}>
            Restart from Day 1
          </button>
          <button type="button" className={shared.continueBtn} onClick={onNextChapter}>
            Go to Chapter 2
          </button>
        </div>
      </div>
    </>
  );
}
