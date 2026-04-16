import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { defaultDataset, generateFreshBatch, type CVSample } from "../../../data/dataset";
import { useSimulator } from "../../../context/SimulatorContext";
import { predictAll, computeMetrics, type Metrics } from "../../../utils/predict";
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

// ─── Stress-test comparison row ───────────────────────────────────────────────

function CompareRow({ label, original, fresh }: {
  label: string;
  original: string;
  fresh: string;
}) {
  return (
    <div className={styles.compareRow}>
      <span className={styles.compareLabel}>{label}</span>
      <span className={styles.compareOriginal}>{original}</span>
      <span className={styles.compareArrow}>&rarr;</span>
      <span className={styles.compareFresh}>{fresh}</span>
    </div>
  );
}

function StressResult({ original, fresh }: { original: Metrics; fresh: Metrics }) {
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const freshAccOk = fresh.accuracy >= 0.8;
  const freshGapOk = fresh.tprGap <= 0.05;
  const freshPassed = freshAccOk && freshGapOk;

  return (
    <div className={styles.stressResult}>
      <div className={`${styles.stressBanner} ${freshPassed ? styles.stressBannerPass : styles.stressBannerFail}`}>
        <p className={styles.stressVerdict}>
          {freshPassed ? "Stress test passed" : "Stress test failed"}
        </p>
        <p className={styles.stressVerdictSub}>
          {freshPassed
            ? "Your boundary generalizes — it held up on an unseen cohort."
            : "Your boundary was tuned to one cohort. On fresh applicants, the audit breaks."}
        </p>
      </div>

      <div className={styles.compareGrid}>
        <div />
        <span className={styles.compareColHead}>Training cohort</span>
        <div />
        <span className={styles.compareColHead}>Fresh cohort</span>

        <CompareRow label="Accuracy" original={pct(original.accuracy)} fresh={pct(fresh.accuracy)} />
        <CompareRow label="TPR A" original={pct(original.tprA)} fresh={pct(fresh.tprA)} />
        <CompareRow label="TPR B" original={pct(original.tprB)} fresh={pct(fresh.tprB)} />
        <CompareRow label="Gap" original={`${Math.round(original.tprGap * 100)}pp`} fresh={`${Math.round(fresh.tprGap * 100)}pp`} />
      </div>

      <div className={styles.panel} style={{ marginTop: 0 }}>
        <p className={styles.panelEyebrow}>What happened?</p>
        <p className={styles.panelBody}>
          {freshPassed
            ? "Your decision boundary is robust — it maintained both accuracy and fairness on a new sample drawn from the same population. That said, real-world distributions shift over time, so ongoing monitoring is still essential."
            : "The boundary you tuned was fit to the specific noise in your training cohort. A new sample from the same underlying population reshuffles who lands near the decision boundary, and the fairness constraint breaks."}
        </p>
        <p className={styles.panelBody} style={{ marginTop: 12 }}>
          <strong>The misconception:</strong> adding soft skill seemed to "fix" fairness because
          it happened to be equally distributed across groups <em>in this specific sample</em>.
          But more features don't inherently mean more fair — they give the boundary more degrees
          of freedom, which makes it easier to overfit to one cohort's noise.
          {freshPassed
            ? " Your boundary survived one reshuffle, but a different population shift could still break it."
            : " That's exactly what happened here: the extra dimension let you thread a needle that only existed in the original data."}
        </p>
        <p className={styles.panelBody} style={{ marginTop: 12 }}>
          Fairness is not a property of the feature set — it's a property of the
          process. It requires ongoing monitoring, not a one-time fix.
        </p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const STRESS_SEED = 20260415; // different from the default dataset seed

export default function EvaluationPhase() {
  const { b1, b2, b3, phase2Unlocked } = useSimulator();
  const [stressActive, setStressActive] = useState(false);

  const preds = useMemo(
    () => predictAll(defaultDataset, b1, b2, phase2Unlocked, b3),
    [b1, b2, b3, phase2Unlocked],
  );
  const hiredSet = useMemo(
    () => new Set(preds.filter((p) => p.hired).map((p) => p.id)),
    [preds],
  );
  const m = useMemo(() => computeMetrics(defaultDataset, preds), [preds]);

  // Fresh batch — only generated once stress test is activated
  const freshBatch = useMemo(
    () => stressActive ? generateFreshBatch(240, STRESS_SEED) : [],
    [stressActive],
  );
  const freshMetrics = useMemo(() => {
    if (!stressActive) return null;
    const freshPreds = predictAll(freshBatch, b1, b2, phase2Unlocked, b3);
    return computeMetrics(freshBatch, freshPreds);
  }, [stressActive, freshBatch, b1, b2, b3, phase2Unlocked]);

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

      {/* Go back to fix */}
      {!passed && (
        <div className={styles.continueRow}>
          <p className={styles.continueHint}>The boundary needs adjusting.</p>
          <Link to="/simulator/classifier" className={styles.continueBtn}>
            ← Back to classifier
          </Link>
        </div>
      )}

      {/* Stress test — only shown after passing */}
      {passed && !stressActive && (
        <div className={styles.unlockCard}>
          <div className={styles.unlockText}>
            <p className={styles.unlockTitle}>But would it hold up next year?</p>
            <p className={styles.unlockBody}>
              Your boundary works on this cohort. Run it against 240 fresh applicants drawn from
              the same population — and see whether fairness survives the reshuffle.
            </p>
          </div>
          <button type="button" className={styles.unlockBtn} onClick={() => setStressActive(true)}>
            Stress test →
          </button>
        </div>
      )}

      {passed && stressActive && freshMetrics && (
        <>
          <StressResult original={m} fresh={freshMetrics} />
          <div className={styles.continueRow}>
            <p className={styles.continueHint}>See the full bias taxonomy and what you learned.</p>
            <Link to="/simulator/debrief" className={styles.continueBtn}>
              Continue to debrief →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
