import { useMemo } from "react";
import { Link } from "react-router-dom";
import { defaultDataset, type CVSample } from "../../../data/dataset";
import { useSimulator } from "../../../context/SimulatorContext";
import { predictAll, computeMetrics } from "../../../utils/predict";
import styles from "../Phase.module.css";

// ─── False-negative scatter (tech × experience) ───────────────────────────────

const EW = 480, EH = 300;
const EP = { l: 44, r: 16, t: 16, b: 40 };
const EIW = EW - EP.l - EP.r;
const EIH = EH - EP.t - EP.b;
const emx = (v: number) => EP.l + (v / 100) * EIW;
const emy = (v: number) => EP.t + (1 - v / 100) * EIH;

function AuditScatter({ samples, hiredSet }: {
  samples: CVSample[];
  hiredSet: Set<number>;
}) {
  return (
    <figure className={styles.auditFigure}>
      <svg viewBox={`0 0 ${EW} ${EH}`} className={styles.scatterSvg}
        role="img" aria-label="Audit scatter: false negatives highlighted">
        <line x1={EP.l} y1={EP.t + EIH} x2={EP.l + EIW} y2={EP.t + EIH} stroke="#c9c9cd" strokeWidth="1" />
        <line x1={EP.l} y1={EP.t} x2={EP.l} y2={EP.t + EIH} stroke="#c9c9cd" strokeWidth="1" />

        {[20, 40, 60, 80].map((v) => (
          <g key={v}>
            <line x1={emx(v)} y1={EP.t} x2={emx(v)} y2={EP.t + EIH} stroke="#ebebef" strokeWidth="1" />
            <line x1={EP.l} y1={emy(v)} x2={EP.l + EIW} y2={emy(v)} stroke="#ebebef" strokeWidth="1" />
            <text x={emx(v)} y={EP.t + EIH + 14} textAnchor="middle" fontSize="10" fill="#8d969e">{v}</text>
            <text x={EP.l - 6} y={emy(v) + 3} textAnchor="end" fontSize="10" fill="#8d969e">{v}</text>
          </g>
        ))}

        <text x={EP.l + EIW / 2} y={EH - 4} textAnchor="middle" fontSize="11" fill="#8d969e">Tech Score →</text>
        <text x={12} y={EP.t + EIH / 2} textAnchor="middle" fontSize="11" fill="#8d969e"
          transform={`rotate(-90 12 ${EP.t + EIH / 2})`}>↑ Experience</text>

        {/* Layer 1 — TN: tiny dim dots */}
        {samples
          .filter((s) => !hiredSet.has(s.id) && !s.qualified)
          .map((s) => (
            <circle key={s.id}
              cx={emx(s.techScore)} cy={emy(s.experience)}
              r={2.5} fill={s.group === "A" ? "#494fdf" : "#e61e49"} opacity={0.15} />
          ))}

        {/* Layer 2 — hired (TP + FP): solid circles */}
        {samples
          .filter((s) => hiredSet.has(s.id))
          .map((s) => (
            <circle key={s.id}
              cx={emx(s.techScore)} cy={emy(s.experience)}
              r={4} fill={s.group === "A" ? "#494fdf" : "#e61e49"} opacity={0.9} />
          ))}

        {/* Layer 3 — FN: diamonds on top */}
        {samples
          .filter((s) => s.qualified && !hiredSet.has(s.id))
          .map((s) => {
            const cx = emx(s.techScore);
            const cy = emy(s.experience);
            const r = 5.5;
            return (
              <polygon key={s.id}
                points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
                fill={s.group === "A" ? "#494fdf" : "#e61e49"} opacity={0.9} />
            );
          })}
      </svg>
      <figcaption className={styles.auditFigCaption}>
        {/* Hired: split circle */}
        <span className={styles.legendItem}>
          <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: "inline-block", verticalAlign: "middle" }}>
            <path d="M 6,2 A 4,4 0 0,0 6,10 Z" fill="#494fdf" opacity="0.65" />
            <path d="M 6,2 A 4,4 0 0,1 6,10 Z" fill="#e61e49" opacity="0.65" />
          </svg>
          Hired
        </span>
        {/* False neg.: split diamond */}
        <span className={styles.legendItem}>
          <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: "inline-block", verticalAlign: "middle" }}>
            <polygon points="6,0 0,6 6,12" fill="#494fdf" opacity="0.9" />
            <polygon points="6,0 12,6 6,12" fill="#e61e49" opacity="0.9" />
          </svg>
          False negatives
        </span>
        {/* Rejected TN: split circle, dim */}
        <span className={styles.legendItem}>
          <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: "inline-block", verticalAlign: "middle" }}>
            <path d="M 6,2 A 4,4 0 0,0 6,10 Z" fill="#494fdf" opacity="0.2" />
            <path d="M 6,2 A 4,4 0 0,1 6,10 Z" fill="#e61e49" opacity="0.2" />
          </svg>
          Rejected
        </span>
      </figcaption>
    </figure>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: "pass" | "fail" | "neutral";
}) {
  return (
    <div className={`${styles.metCard} ${accent ? styles[`metCard_${accent}`] : ""}`}>
      <p className={styles.metCardLabel}>{label}</p>
      <p className={styles.metCardValue}>{value}</p>
      {sub && <p className={styles.metCardSub}>{sub}</p>}
    </div>
  );
}

// ─── TPR comparison bar ───────────────────────────────────────────────────────

function TprBar({ tprA, tprB }: { tprA: number; tprB: number }) {
  return (
    <div className={styles.tprBar}>
      <div className={styles.tprRow}>
        <span className={styles.tprLabel}>Group A</span>
        <div className={styles.tprTrack}>
          <div className={styles.tprFillA} style={{ width: `${Math.round(tprA * 100)}%` }} />
        </div>
        <span className={styles.tprValue}>{Math.round(tprA * 100)}%</span>
      </div>
      <div className={styles.tprRow}>
        <span className={styles.tprLabel}>Group B</span>
        <div className={styles.tprTrack}>
          <div className={styles.tprFillB} style={{ width: `${Math.round(tprB * 100)}%` }} />
        </div>
        <span className={styles.tprValue}>{Math.round(tprB * 100)}%</span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EvaluationPhase() {
  const { b1, b2, phase2Unlocked } = useSimulator();

  const preds = useMemo(
    () => predictAll(defaultDataset, b1, b2, phase2Unlocked),
    [b1, b2, phase2Unlocked],
  );
  const hiredSet = useMemo(
    () => new Set(preds.filter((p) => p.hired).map((p) => p.id)),
    [preds],
  );
  const m = useMemo(() => computeMetrics(defaultDataset, preds), [preds]);

  const accuracyOk = m.accuracy >= 0.8;
  const gapOk = m.tprGap <= 0.05;
  const passed = accuracyOk && gapOk;

  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className={styles.phase}>
      <p className={styles.lede}>
        Your boundary is submitted. The auditor checks two things: overall accuracy must exceed
        80%, and the True Positive Rate gap between groups must stay under 5 percentage points.
      </p>

      {/* Audit verdict */}
      <div className={`${styles.auditBanner} ${passed ? styles.auditBannerPass : styles.auditBannerFail}`}>
        <p className={styles.auditVerdict}>
          {passed ? "Audit passed ✓" : "Audit failed ✗"}
        </p>
        <p className={styles.auditVerdictSub}>
          {passed
            ? `Accuracy ${pct(m.accuracy)} · TPR gap ${Math.round(m.tprGap * 100)}pp — both constraints satisfied.`
            : `${!accuracyOk ? `Accuracy ${pct(m.accuracy)} is below 80%. ` : ""}${!gapOk ? `TPR gap is ${Math.round(m.tprGap * 100)}pp — ${m.fnB} qualified Group B candidates rejected.` : ""}`
          }
        </p>
      </div>

      {/* Metric cards */}
      <div className={styles.metGrid}>
        <MetCard
          label="Overall accuracy"
          value={pct(m.accuracy)}
          sub={`${m.hired} of ${defaultDataset.length} candidates hired`}
          accent={accuracyOk ? "pass" : "fail"}
        />
        <MetCard
          label="TPR · Group A"
          value={pct(m.tprA)}
          sub={`${m.fnA} false negatives`}
          accent="neutral"
        />
        <MetCard
          label="TPR · Group B"
          value={pct(m.tprB)}
          sub={`${m.fnB} false negatives`}
          accent="neutral"
        />
        <MetCard
          label="TPR gap |A − B|"
          value={`${Math.round(m.tprGap * 100)}pp`}
          sub={gapOk ? "Within the 5pp threshold" : "Exceeds the 5pp threshold"}
          accent={gapOk ? "pass" : "fail"}
        />
      </div>

      {/* TPR visual comparison */}
      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Qualified Candidate Discovery Rate</p>
        <h2 className={styles.h2}>TPR by group</h2>
        <p className={styles.panelBody}>
          The True Positive Rate measures what fraction of genuinely qualified candidates in each
          group the model actually hires. Equal opportunity means these two bars should be close.
        </p>
        <TprBar tprA={m.tprA} tprB={m.tprB} />
      </div>

      {/* False negative scatter */}
      {/* <div className={styles.panel}>
        <p className={styles.panelEyebrow}>False negatives</p>
        <h2 className={styles.h2}>Who the model rejected.</h2>
        <p className={styles.panelBody}>
          Dashed rings mark qualified candidates your boundary rejected. The story is in which
          group they belong to — and how many there are.
        </p>
        <AuditScatter samples={defaultDataset} hiredSet={hiredSet} />
      </div> */}

      {/* Go back to fix */}
      {!passed && (
        <div className={styles.continueRow}>
          <p className={styles.continueHint}>The boundary needs adjusting.</p>
          <Link to="/simulator/classifier" className={styles.continueBtn}>
            ← Back to classifier
          </Link>
        </div>
      )}

      {passed && (
        <div className={`${styles.continueRow} ${styles.continueRowPass}`}>
          <p className={styles.continueHint}>You found a fair boundary. That's the whole exercise.</p>
        </div>
      )}
    </div>
  );
}
