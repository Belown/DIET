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

type ScoreTone = "good" | "mid" | "low";

type MetricCardProps = {
  label: string;
  value: string;
  status: string;
  tone: ScoreTone;
  percent?: number;
};

const scoreTone = (value: number): ScoreTone => {
  if (value >= 0.75) return "good";
  if (value >= 0.6) return "mid";
  return "low";
};

const scoreStatus = (value: number) => {
  if (value >= 0.75) return "Strong";
  if (value >= 0.6) return "Watch";
  return "Needs attention";
};

function MetricCard({ label, value, status, tone, percent }: MetricCardProps) {
  return (
    <div className={`${styles.metricCard} ${styles[`metricCard_${tone}`]}`}>
      <div className={styles.metricTopline}>
        <span>{label}</span>
        <strong>{status}</strong>
      </div>
      <p className={styles.metricValue}>{value}</p>
      {typeof percent === "number" ? (
        <div className={styles.metricTrack} aria-hidden="true">
          <div className={styles.metricFill} style={{ "--bar-width": `${Math.round(percent * 100)}%` } as React.CSSProperties} />
        </div>
      ) : (
        <div className={styles.riskBand} aria-hidden="true" />
      )}
    </div>
  );
}

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
  const riskTone: ScoreTone = overallAcc >= 0.8 ? "good" : overallAcc >= 0.6 ? "mid" : "low";
  const showCelebration = riskTone === "good";

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
    if (overallAcc < 0.75) actions.push("Review which collected signals strengthened the dataset and which ones distorted it.");
    if (!actions.length) actions.push("Keep this strategy as baseline and monitor drift each retraining cycle.");
    actions.push("Audit who gets misclassified, not just the average score.");
    return actions;
  }, [otherCityOvr, overallAcc, sampledFlags]);

  return (
    <>
      {showCelebration && (
        <div className={styles.celebration} role="status" aria-live="polite">
          <div className={styles.celebrationRings} aria-hidden="true" />
          <div className={styles.celebrationBurst} aria-hidden="true">
            {Array.from({ length: 36 }).map((_, index) => (
              <span
                key={index}
                className={styles.celebrationParticle}
                style={{
                  "--particle-index": index,
                  "--particle-distance": `${140 + (index % 7) * 32}px`,
                  "--particle-hue": 138 + index * 13,
                } as React.CSSProperties}
              />
            ))}
          </div>
          <div className={styles.celebrationCard}>
            <span className={styles.celebrationSeal} aria-hidden="true">LOW RISK</span>
            <span className={styles.celebrationKicker}>Timeline stabilized</span>
            <strong>Congratulations</strong>
            <p>The final model reached Low Risk. Your investigation built a stronger, fairer dataset.</p>
            <div className={styles.celebrationStats} aria-hidden="true">
              <span>Bias reduced</span>
              <span>Coverage restored</span>
              <span>Case cleared</span>
            </div>
          </div>
        </div>
      )}

      <section className={styles.panel}>
        <p className={styles.panelEyebrow}>Case Closure · Day 3 Final Report</p>
        <h2 className={styles.h2}>AI Justice Investigation Outcome</h2>
        <p className={styles.panelBody}>Three field days are complete. This report summarizes model performance, transfer risk, and what to do next.</p>
        <div className={styles.metricStrip}>
          <MetricCard
            label="Overall"
            value={pct(overallAcc)}
            status={scoreStatus(overallAcc)}
            tone={scoreTone(overallAcc)}
            percent={overallAcc}
          />
          <MetricCard
            label="Neighbor City"
            value={pct(otherCityOvr)}
            status={scoreStatus(otherCityOvr)}
            tone={scoreTone(otherCityOvr)}
            percent={otherCityOvr}
          />
          <MetricCard
            label="Risk"
            value={riskLevel}
            status={riskTone === "good" ? "Deploy watch" : riskTone === "mid" ? "Review" : "Stop"}
            tone={riskTone}
          />
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
