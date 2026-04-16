import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { defaultDataset, type CVSample } from "../../../data/dataset";
import { useSimulator, type BoundaryParams } from "../../../context/SimulatorContext";
import { predictAll, computeMetrics } from "../../../utils/predict";
import { Scene3D } from "../Scene3D/Scene3D";
import styles from "../Phase.module.css";
import { max } from "three/tsl";

// ─── Scatter SVG ──────────────────────────────────────────────────────────────

const SW = 420, SH = 300;
const PAD = { l: 44, r: 16, t: 16, b: 40 };

// Data-point sizes (2D scatter) — tweak these to resize all markers at once
const DOT = { tp: 3, fp: 6, fn: 3.5, tn: 3 };
const IW = SW - PAD.l - PAD.r;
const IH = SH - PAD.t - PAD.b;
const mx = (v: number) => PAD.l + (v / 100) * IW;
const my = (v: number) => PAD.t + (1 - v / 100) * IH;

function ScatterPlot({
  xKey, xLabel, samples, hiredSet, boundary, clipId,
}: {
  xKey: "techScore" | "softSkill";
  xLabel: string;
  samples: CVSample[];
  hiredSet: Set<number>;
  boundary: BoundaryParams;
  clipId: string;
}) {
  const { slope, intercept } = boundary;
  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} className={styles.scatterSvg}
      role="img" aria-label={`${xLabel} × Experience scatter with decision boundary`}>
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD.l} y={PAD.t} width={IW} height={IH} />
        </clipPath>
      </defs>

      <line x1={PAD.l} y1={PAD.t + IH} x2={PAD.l + IW} y2={PAD.t + IH} stroke="#c9c9cd" strokeWidth="1" />
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + IH} stroke="#c9c9cd" strokeWidth="1" />

      {[20, 40, 60, 80].map((v) => (
        <g key={v}>
          <line x1={mx(v)} y1={PAD.t} x2={mx(v)} y2={PAD.t + IH} stroke="#ebebef" strokeWidth="1" />
          <line x1={PAD.l} y1={my(v)} x2={PAD.l + IW} y2={my(v)} stroke="#ebebef" strokeWidth="1" />
          <text x={mx(v)} y={PAD.t + IH + 14} textAnchor="middle" fontSize="10" fill="#8d969e">{v}</text>
          <text x={PAD.l - 6} y={my(v) + 3} textAnchor="end" fontSize="10" fill="#8d969e">{v}</text>
        </g>
      ))}

      <text x={PAD.l + IW / 2} y={SH - 4} textAnchor="middle" fontSize="11" fill="#8d969e">{xLabel} →</text>
      <text x={12} y={PAD.t + IH / 2} textAnchor="middle" fontSize="11" fill="#8d969e"
        transform={`rotate(-90 12 ${PAD.t + IH / 2})`}>↑ Experience</text>

      <g clipPath={`url(#${clipId})`}>
        {/* Layer 1 — TN (not qualified, not hired): small dim circles, group color */}
        {samples
          .filter((s) => !hiredSet.has(s.id) && !s.qualified)
          .map((s) => (
            <circle key={s.id}
              cx={mx(s[xKey] as number)} cy={my(s.experience)}
              r={DOT.tn} fill={s.group === "A" ? "#494fdf" : "#e61e49"} opacity={0.18} />
          ))}

        {/* Layer 2 — FP (not qualified, hired): medium amber squares */}
        {samples
          .filter((s) => hiredSet.has(s.id) && !s.qualified)
          .map((s) => (
            <rect key={s.id}
              x={mx(s[xKey] as number) - DOT.fp / 2} y={my(s.experience) - DOT.fp / 2}
              width={DOT.fp} height={DOT.fp} fill="#e8a308" opacity={0.85} />
          ))}

        {/* Layer 3 — TP (qualified, hired): large solid circles, group color */}
        {samples
          .filter((s) => hiredSet.has(s.id) && s.qualified)
          .map((s) => (
            <circle key={s.id}
              cx={mx(s[xKey] as number)} cy={my(s.experience)}
              r={DOT.tp} fill={s.group === "A" ? "#494fdf" : "#e61e49"} opacity={0.9} />
          ))}

        {/* Layer 4 — FN (qualified, not hired): large amber diamonds */}
        {samples
          .filter((s) => s.qualified && !hiredSet.has(s.id))
          .map((s) => {
            const cx = mx(s[xKey] as number);
            const cy = my(s.experience);
            return (
              <polygon key={s.id}
                points={`${cx},${cy - DOT.fn} ${cx + DOT.fn},${cy} ${cx},${cy + DOT.fn} ${cx - DOT.fn},${cy}`}
                fill="#e8a308" opacity={0.9} />
            );
          })}

        <line x1={mx(0)} y1={my(intercept)} x2={mx(100)} y2={my(slope * 100 + intercept)}
          stroke="#191c1f" strokeWidth="2.5" strokeDasharray="8 5" strokeLinecap="round" />
      </g>

      <text x={PAD.l + IW * 0.78} y={PAD.t + 22} textAnchor="middle" fontSize="10" fill="#191c1f" opacity="0.3" fontWeight="500">predicted hire</text>
      <text x={PAD.l + IW * 0.22} y={PAD.t + IH - 10} textAnchor="middle" fontSize="10" fill="#191c1f" opacity="0.3" fontWeight="500">predicted reject</text>

      {/* Legend — four entries: TP, FP, FN, TN */}
      {/* 1. TP: large circle, split A/B */}
      <path d={`M ${PAD.l+9},${PAD.t+5} A 5,5 0 0,0 ${PAD.l+9},${PAD.t+15} Z`} fill="#494fdf" opacity="0.9" />
      <path d={`M ${PAD.l+9},${PAD.t+5} A 5,5 0 0,1 ${PAD.l+9},${PAD.t+15} Z`} fill="#e61e49" opacity="0.9" />
      <text x={PAD.l+17} y={PAD.t+14} fontSize="10" fill="#8d969e">TP</text>

      {/* 2. FP: amber square */}
      <rect x={PAD.l+36} y={PAD.t+6} width="8" height="8" fill="#e8a308" opacity="0.85" />
      <text x={PAD.l+48} y={PAD.t+14} fontSize="10" fill="#8d969e">FP</text>

      {/* 3. FN: amber diamond */}
      <polygon points={`${PAD.l+74},${PAD.t+4} ${PAD.l+79},${PAD.t+10} ${PAD.l+74},${PAD.t+16} ${PAD.l+69},${PAD.t+10}`} fill="#e8a308" opacity="0.9" />
      <text x={PAD.l+83} y={PAD.t+14} fontSize="10" fill="#8d969e">FN</text>

      {/* 4. TN: small dim circle, split A/B */}
      <path d={`M ${PAD.l+102},${PAD.t+7} A 3,3 0 0,0 ${PAD.l+102},${PAD.t+13} Z`} fill="#494fdf" opacity="0.2" />
      <path d={`M ${PAD.l+102},${PAD.t+7} A 3,3 0 0,1 ${PAD.l+102},${PAD.t+13} Z`} fill="#e61e49" opacity="0.2" />
      <text x={PAD.l+109} y={PAD.t+14} fontSize="10" fill="#8d969e">TN</text>
    </svg>
  );
}

// ─── Sliders ──────────────────────────────────────────────────────────────────

function SliderBlock({ label, boundary, onChange }: {
  label: string;
  boundary: BoundaryParams;
  onChange: (b: BoundaryParams) => void;
}) {
  return (
    <div className={styles.sliderBlock}>
      <p className={styles.sliderBlockLabel}>{label}</p>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Slope</span>
        <input type="range" min={-1.5} max={1.5} step={0.01}
          value={boundary.slope}
          onChange={(e) => onChange({ ...boundary, slope: parseFloat(e.target.value) })}
          className={styles.sliderInput} />
        <span className={styles.sliderValue}>{boundary.slope.toFixed(2)}</span>
      </div>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Intercept</span>
        <input type="range" min={-100} max={100} step={1}
          value={boundary.intercept}
          onChange={(e) => onChange({ ...boundary, intercept: parseFloat(e.target.value) })}
          className={styles.sliderInput} />
        <span className={styles.sliderValue}>{boundary.intercept}</span>
      </div>
    </div>
  );
}

// ─── Live metrics bar ─────────────────────────────────────────────────────────

function LiveBar({ accuracy, tprA, tprB, tprGap, showGap = true }: {
  accuracy: number; tprA: number; tprB: number; tprGap: number; showGap?: boolean;
}) {
  const pass = showGap ? accuracy >= 0.8 && tprGap <= 0.05 : accuracy >= 0.8;
  return (
    <div className={`${styles.liveBar} ${pass ? styles.liveBarPass : styles.liveBarFail}`}>
      <span className={styles.liveItem}>
        <span className={styles.liveK}>Accuracy</span>
        <span className={styles.liveV}>{pct(accuracy)}</span>
      </span>
      {showGap && (
        <>
          <span className={styles.liveDivider} />
          <span className={styles.liveItem}>
            <span className={styles.liveK}>TPR A</span>
            <span className={styles.liveV}>{pct(tprA)}</span>
          </span>
          <span className={styles.liveDivider} />
          <span className={styles.liveItem}>
            <span className={styles.liveK}>TPR B</span>
            <span className={styles.liveV}>{pct(tprB)}</span>
          </span>
          <span className={styles.liveDivider} />
          <span className={styles.liveItem}>
            <span className={styles.liveK}>Gap</span>
            <span className={styles.liveV}>{Math.round(tprGap * 100)}pp</span>
          </span>
        </>
      )}
      <span className={`${styles.liveAudit} ${pass ? styles.liveAuditPass : styles.liveAuditFail}`}>
        {pass ? (showGap ? "Audit pass ✓" : "Target met ✓") : (showGap ? "Audit fail ✗" : "Below target ✗")}
      </span>
    </div>
  );
}

function pct(v: number) { return `${Math.round(v * 100)}%`; }

// ─── Unlock card ──────────────────────────────────────────────────────────────

function UnlockCard({ title, body, buttonLabel, onUnlock }: {
  title: string; body: string; buttonLabel: string; onUnlock: () => void;
}) {
  return (
    <div className={styles.unlockCard}>
      <div className={styles.unlockText}>
        <p className={styles.unlockTitle}>{title}</p>
        <p className={styles.unlockBody}>{body}</p>
      </div>
      <button type="button" className={styles.unlockBtn} onClick={onUnlock}>
        {buttonLabel} →
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type CStep = 1 | 2 | 3;

export default function ClassifierPhase() {
  const { b1, setB1, b2, setB2, phase2Unlocked, setPhase2Unlocked, phase3Unlocked, setPhase3Unlocked } = useSimulator();
  const [step, setStep] = useState<CStep>(phase3Unlocked ? 3 : phase2Unlocked ? 2 : 1);

  const preds = useMemo(
    () => predictAll(defaultDataset, b1, b2, step >= 2 && phase2Unlocked),
    [b1, b2, step, phase2Unlocked],
  );
  const hiredSet = useMemo(
    () => new Set(preds.filter((p) => p.hired).map((p) => p.id)),
    [preds],
  );
  const metrics = useMemo(() => computeMetrics(defaultDataset, preds), [preds]);

  return (
    <div className={styles.phase}>

      {/* Phase tabs */}
      <div className={styles.stepTabs}>
        <button type="button"
          className={`${styles.stepTab} ${step === 1 ? styles.stepTabActive : ""}`}
          onClick={() => setStep(1)}>
          Phase 1 · 2D
        </button>
        {phase2Unlocked && (
          <button type="button"
            className={`${styles.stepTab} ${step === 2 ? styles.stepTabActive : ""}`}
            onClick={() => setStep(2)}>
            Phase 2 · Soft Skill
          </button>
        )}
        {phase3Unlocked && (
          <button type="button"
            className={`${styles.stepTab} ${step === 3 ? styles.stepTabActive : ""}`}
            onClick={() => setStep(3)}>
            Phase 3 · 3D
          </button>
        )}
      </div>

      {/* ── Phase 1 ── */}
      {step === 1 && (
        <>
          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Phase 1 · Tech × Experience</p>
            <h2 className={styles.h2}>Draw the decision boundary.</h2>
            <p className={styles.panelBody}>
              Adjust slope and intercept to separate predicted hires from rejects.
              Dashed rings mark qualified candidates your line rejects — the false negatives.
              For now, aim for <strong>80% accuracy</strong>. The fairness audit comes once you unlock the second axis.
            </p>
          </div>

          <div className={styles.plotCard} style={{ maxWidth: 620, marginInline: "auto" }}>
            <ScatterPlot xKey="techScore" xLabel="Tech Score"
              samples={defaultDataset} hiredSet={hiredSet} boundary={b1} clipId="clip-p1" />
            <SliderBlock label="Boundary · Tech × Experience" boundary={b1} onChange={setB1} />
          </div>

          <LiveBar {...metrics} showGap={false} />

          <UnlockCard
            title="Stuck on the audit?"
            body="A single line on two features can't satisfy both constraints at once. Unlock soft skill — the third axis the model has been ignoring — and see if it changes the shape of fair."
            buttonLabel="Unlock Soft Skill"
            onUnlock={() => { setPhase2Unlocked(true); setStep(2); }}
          />
        </>
      )}

      {/* ── Phase 2 ── */}
      {step === 2 && (
        <>
          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Phase 2 · Soft Skill unlocked</p>
            <h2 className={styles.h2}>A second boundary on soft skill.</h2>
            <p className={styles.panelBody}>
              Candidates rejected by boundary 1 get a second chance here — if they clear the
              soft skill × experience line, they're hired. Adjust both boundaries and watch the
              fairness gap respond.
            </p>
          </div>

          <div className={styles.plotCard}>
            <div className={styles.scatterGrid}>
              <div>
                <p className={styles.scatterCaption}>Tech × Experience</p>
                <ScatterPlot xKey="techScore" xLabel="Tech Score"
                  samples={defaultDataset} hiredSet={hiredSet} boundary={b1} clipId="clip-p2a" />
                <SliderBlock label="Boundary 1" boundary={b1} onChange={setB1} />
              </div>
              <div>
                <p className={styles.scatterCaption}>Soft Skill × Experience</p>
                <ScatterPlot xKey="softSkill" xLabel="Soft Skill"
                  samples={defaultDataset} hiredSet={hiredSet} boundary={b2} clipId="clip-p2b" />
                <SliderBlock label="Boundary 2" boundary={b2} onChange={setB2} />
              </div>
            </div>
          </div>

          <LiveBar {...metrics} />

          <UnlockCard
            title="See both boundaries in 3D"
            body="These two 2D lines are actually planes in a 3D space. Unlock the synthesis view to see the manifold they create together — and understand why the shape of fair isn't a line."
            buttonLabel="View in 3D"
            onUnlock={() => { setPhase3Unlocked(true); setStep(3); }}
          />
        </>
      )}

      {/* ── Phase 3 ── */}
      {step === 3 && (
        <>
          <div className={styles.panel}>
            <p className={styles.panelEyebrow}>Phase 3 · 3D manifold</p>
            <h2 className={styles.h2}>The decision surface in full.</h2>
            <p className={styles.panelBody}>
              The blue plane is your tech × experience boundary; the red plane is your soft skill
              boundary. Candidates above either plane are hired. Drag to rotate, scroll to zoom.
            </p>
          </div>

          <div className={styles.plotCard}>
            <Scene3D b1={b1} b2={b2} hiredSet={hiredSet} />
          </div>

          <LiveBar {...metrics} />

          <div className={styles.continueRow}>
            <p className={styles.continueHint}>Ready to run the full audit?</p>
            <Link to="/simulator/evaluation" className={styles.continueBtn}>
              Continue to evaluation →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
