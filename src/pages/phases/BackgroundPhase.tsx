import { Link } from "react-router-dom";
import phase from "./Phase.module.css";
import styles from "./BackgroundPhase.module.css";

export default function BackgroundPhase() {
  return (
    <div className={phase.phase}>
      <p className={phase.lede}>
        Before you touch a model, it helps to know what kind of mess you're walking into. Read this five-minute primer — it reframes what "incomplete data" really means and why a perfectly accurate classifier can still engineer a discriminatory barrier.
      </p>

      <section className={`${phase.panel} ${styles.sectionPanel}`}>
        <p className={styles.eyebrow}>§ 01 · Reframing "incomplete data"</p>
        <h2 className={styles.h2}>
          Your dataset isn't missing values.
          <br />
          It's missing <em>context</em>.
        </h2>
        <p className={styles.body}>
          In a typical ML course, "incomplete data" means a few{" "} <code className={styles.code}>NaN</code>s in a column you can interpolate away. In the real world — hiring, lending, healthcare, policing — the data is usually complete. Every row is filled in. That's exactly what makes it dangerous. The numbers are real, but the world they describe might not be the world you wish you were modeling.
        </p>

        <div className={styles.conceptGrid}>
          <article className={`${styles.concept} ${styles.conceptBlue}`}>
            <p className={styles.conceptK}>The proxy problem</p>
            <h3 className={styles.conceptT}>
              You're not measuring what you think you are.
            </h3>
            <p className={styles.conceptB}>
              Models almost never see the actual ground truth — like "would this person be good at the job". They see a stand-in: years of experience, GPA, credit score. If the proxy inherits historical bias, optimizing accuracy on it mathematically reinforces that bias.
            </p>
          </article>

          <article className={`${styles.concept} ${styles.conceptPink}`}>
            <p className={styles.conceptK}>Missing not at random</p>
            <h3 className={styles.conceptT}>
              The blanks aren't blank by accident.
            </h3>
            <p className={styles.conceptB}>
              When a "portfolio score" is empty, it's rarely random. It might mean a candidate worked a second job through university and had no time for side projects. Strictly enforcing optional fields doesn't just filter for talent, it filters for privilege.
            </p>
          </article>

          <article className={`${styles.concept} ${styles.conceptTeal}`}>
            <p className={styles.conceptK}>Survivorship bias</p>
            <h3 className={styles.conceptT}>
              You only see the ones who got in.
            </h3>
            <p className={styles.conceptB}>
              Historical hiring data only contains performance metrics for people the company actually hired. The model confuses a lack of past <em>opportunity</em> for a group with a lack of inherent{" "} <em>capability</em>. Doors that were never opened look, statistically, like doors that should stay shut.
            </p>
          </article>
        </div>
      </section>

      <section className={`${phase.panel} ${styles.sectionPanel}`}>
        <p className={styles.eyebrow}>§ 02 · Anatomy of a CV</p>
        <h2 className={styles.h2}>
          Three features. Three biases hiding in plain sight.
        </h2>
        <p className={styles.body}>
          The simulator hands you three knobs to evaluate each candidate. None of them are neutral.
        </p>

        <div className={styles.axisStack}>
          <article className={styles.axis}>
            <span className={`${styles.axisTag} ${styles.axisX}`}>
              X · Tech score
            </span>
            <div>
              <h3 className={styles.axisT}>Looks objective. Isn't quite.</h3>
              <p className={styles.axisB}>
                A standardized test feels meritocratic — same questions, same rubric. But access to test prep, tutors, and quiet study time isn't evenly distributed, so even "objective" measurements drift along socioeconomic lines.
              </p>
            </div>
          </article>

          <article className={styles.axis}>
            <span className={`${styles.axisTag} ${styles.axisY}`}>
              Y · Years of experience
            </span>
            <div>
              <h3 className={styles.axisT}>The systemic axis.</h3>
              <p className={styles.axisB}>
                The most vulnerable feature. A low experience score might not be because of skill, but career breaks, late starts, and the hurdles of getting that first chance. Trusting this column verbatim is how the past programs the future.
              </p>
            </div>
          </article>

          <article className={styles.axis}>
            <span className={`${styles.axisTag} ${styles.axisZ}`}>
              Z · Portfolio
            </span>
            <div>
              <h3 className={styles.axisT}>
                A signal of free time as much as skill.
              </h3>
              <p className={styles.axisB}>
                Side projects are a real signal — but mostly of who could afford to build them. In Phase 3 you'll <em>unlock</em> this dimension, and it'll do something surprising to the shape of "fair".
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className={`${phase.panel} ${styles.sectionPanel}`}>
        <p className={styles.eyebrow}>§ 03 · Why one line fails</p>
        <h2 className={styles.h2}>
          A single straight line is a policy decision in disguise.
        </h2>
        <p className={styles.body}>
          When you draw a 2D boundary on tech × experience, you're not just classifying — you're declaring a single bar that everyone must clear. Watch what happens to the qualified Group B candidates that sit just below it.
        </p>
        <BoundaryDiagram />
        <p className={styles.body}>
          The circled points are the <em>false negatives</em> — people the model said no to who, by the ground truth, would have succeeded. You'll fix this in the simulator in two ways: relax the threshold per group, or lift the problem into 3D and find the manifold a flat line can't.
        </p>
      </section>

      <section
        className={`${phase.panel} ${styles.sectionPanel} ${styles.dark}`}
      >
        <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
          § 04 · The ethics audit
        </p>
        <h2 className={`${styles.h2} ${styles.h2Light}`}>
          Equal opportunity, not equal averages.
        </h2>
        <p className={styles.bodyLight}>
          Most fairness metrics ask: <em>did we treat the groups the same?</em>{" "}
          The one we care about is sharper:
        </p>
        <p className={styles.formula}>
          | TPR<sub>A</sub> − TPR<sub>B</sub> | ≤ ε
        </p>
        <p className={styles.bodyLight}>
          That's the <strong>True Positive Rate</strong> by group — or, as we'll call it, the <em>Qualified Candidate Discovery Rate</em>. It guarantees that if you're genuinely qualified, your odds of being seen don't depend on which group you were born into.
        </p>

        <div className={styles.audit}>
          <div className={styles.auditCol}>
            <p className={styles.auditK}>The boss demands</p>
            <p className={styles.auditV}>Overall accuracy &gt; 80%</p>
          </div>
          <div className={styles.auditCol}>
            <p className={styles.auditK}>The auditor demands</p>
            <p className={styles.auditV}>TPR gap ≤ 5%</p>
          </div>
          <div className={styles.auditCol}>
            <p className={styles.auditK}>You will discover</p>
            <p className={styles.auditV}>
              You can't always have both with a single line.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.continueBar}>
        <p className={styles.continueHint}>
          Got it. Now see the data for yourself.
        </p>
        <Link to="/simulator/dataset" className={styles.continueBtn}>
          Continue to the dataset →
        </Link>
      </div>
    </div>
  );
}

type Pt = { x: number; y: number };
type BPt = Pt & { qualified: boolean };

const GROUP_A: Pt[] = [
  { x: 78, y: 32 },
  { x: 70, y: 42 },
  { x: 82, y: 26 },
  { x: 65, y: 38 },
  { x: 88, y: 35 },
  { x: 75, y: 48 },
  { x: 60, y: 45 },
  { x: 85, y: 22 },
  { x: 72, y: 55 },
  { x: 55, y: 50 },
];

const GROUP_B: BPt[] = [
  { x: 50, y: 42, qualified: true },
  { x: 45, y: 48, qualified: true },
  { x: 55, y: 38, qualified: true },
  { x: 40, y: 52, qualified: true },
  { x: 48, y: 45, qualified: true },
  { x: 28, y: 38, qualified: false },
  { x: 35, y: 28, qualified: false },
  { x: 22, y: 50, qualified: false },
  { x: 32, y: 22, qualified: false },
  { x: 18, y: 35, qualified: false },
];

function BoundaryDiagram() {
  const W = 560;
  const H = 340;
  const padL = 56;
  const padR = 32;
  const padT = 32;
  const padB = 52;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const mapX = (x: number) => padL + (x / 100) * innerW;
  const mapY = (y: number) => padT + (1 - y / 100) * innerH;
  const threshold = 95;

  return (
    <figure className={styles.diagram}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.diagramSvg}
        role="img"
        aria-label="Scatter plot showing a single decision boundary missing qualified Group B candidates."
      >
        <rect
          x={padL}
          y={padT}
          width={innerW}
          height={innerH}
          className={styles.diagramFrame}
        />
        {[20, 40, 60, 80].map((g) => (
          <g key={`gx${g}`}>
            <line
              x1={mapX(g)}
              x2={mapX(g)}
              y1={padT}
              y2={padT + innerH}
              className={styles.gridLine}
            />
            <line
              x1={padL}
              x2={padL + innerW}
              y1={mapY(g)}
              y2={mapY(g)}
              className={styles.gridLine}
            />
          </g>
        ))}
        <line
          x1={mapX(0)}
          y1={mapY(threshold)}
          x2={mapX(threshold)}
          y2={mapY(0)}
          className={styles.boundary}
        />
        <text
          x={mapX(78)}
          y={mapY(70)}
          className={styles.regionLabel}
          textAnchor="middle"
        >
          predicted hire
        </text>
        <text
          x={mapX(22)}
          y={mapY(22)}
          className={styles.regionLabelMuted}
          textAnchor="middle"
        >
          predicted reject
        </text>
        {GROUP_A.map((p, i) => (
          <circle
            key={`a${i}`}
            cx={mapX(p.x)}
            cy={mapY(p.y)}
            r={6}
            className={styles.dotA}
          />
        ))}
        {GROUP_B.map((p, i) => {
          const isFN = p.qualified && p.x + p.y < threshold;
          return (
            <g key={`b${i}`}>
              {isFN && (
                <circle
                  cx={mapX(p.x)}
                  cy={mapY(p.y)}
                  r={13}
                  className={styles.fnRing}
                />
              )}
              <circle
                cx={mapX(p.x)}
                cy={mapY(p.y)}
                r={6}
                className={styles.dotB}
              />
            </g>
          );
        })}
        <text
          x={padL + innerW / 2}
          y={H - 14}
          textAnchor="middle"
          className={styles.axisLabel}
        >
          Tech score →
        </text>
        <text
          x={16}
          y={padT + innerH / 2}
          textAnchor="middle"
          className={styles.axisLabel}
          transform={`rotate(-90 16 ${padT + innerH / 2})`}
        >
          ↑ Experience
        </text>
      </svg>
      <figcaption className={styles.diagramCap}>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotASolid}`} />
          Group A
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotBSolid}`} />
          Group B
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendRing} />
          False negatives — qualified, rejected
        </span>
      </figcaption>
    </figure>
  );
}
