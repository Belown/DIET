import { Link } from "react-router-dom";
import phase from "../Phase.module.css";
import styles from "./DebriefPhase.module.css";

// ─── Data ─────────────────────────────────────────────────────────────────────

type BiasRow = {
  type: string;
  description: string;
  inDiet: string | null; // null = not demonstrated
};

const BIAS_TYPES: BiasRow[] = [
  {
    type: "Sampling Bias",
    description:
      "Training data are not representative of the population, leading to poor predictions for certain groups.",
    inDiet:
      "The fixed 240-person training cohort captures one snapshot of the population. The stress test reveals that conclusions tuned on this sample don't generalize to a fresh cohort.",
  },
  {
    type: "Algorithmic Bias",
    description:
      "The algorithm's design inherently prioritizes certain attributes, leading to unfair outcomes regardless of the data.",
    inDiet:
      "A single linear boundary on tech \u00d7 experience structurally disadvantages Group B because it relies on a feature axis that reflects historical inequity, not capability.",
  },
  {
    type: "Measurement Bias",
    description:
      "Data collection or measurement systematically over- or under-represents certain groups.",
    inDiet:
      "Tech score and experience systematically under-represent Group B's true ability. Portfolio is the equally-distributed feature that compensates \u2014 illustrating how measurement choices shape outcomes.",
  },
  {
    type: "Representation Bias",
    description:
      "The dataset does not accurately represent the population it is meant to model.",
    inDiet:
      "Group B is equally sized but their feature distributions are shifted. The dataset doesn't represent Group B fairly in the feature space the default model uses.",
  },
  {
    type: "Confirmation Bias",
    description:
      "The AI system is used to confirm pre-existing biases held by its creators or users.",
    inDiet: null,
  },
  {
    type: "Interaction Bias",
    description:
      "The AI system interacts with humans in a biased manner, resulting in unfair treatment.",
    inDiet: null,
  },
  {
    type: "Generative Bias",
    description:
      "Generative models disproportionately reflect specific attributes or patterns from training data in their outputs.",
    inDiet: null,
  },
];

type FairnessRow = {
  type: string;
  description: string;
  inDiet: string | null;
};

const FAIRNESS_TYPES: FairnessRow[] = [
  {
    type: "Group Fairness / Equal Opportunity",
    description:
      "True positive rate (sensitivity) is equal across demographic groups \u2014 qualified candidates have the same chance of being correctly identified regardless of group membership.",
    inDiet:
      "The audit enforces | TPR_A \u2212 TPR_B | \u2264 5pp. This is directly the equal opportunity criterion.",
  },
  {
    type: "Procedural Fairness",
    description:
      "The decision-making process is transparent, visible, and understandable to users.",
    inDiet:
      "The entire decision boundary is exposed: scatter plots, sliders, 3D manifold, live metrics. The user sees and controls every aspect of the decision process.",
  },
  {
    type: "Individual Fairness",
    description:
      "Similar individuals are treated similarly regardless of group membership.",
    inDiet: null,
  },
  {
    type: "Counterfactual Fairness",
    description:
      "The system would make the same decision for an individual even if their group membership were different.",
    inDiet: null,
  },
  {
    type: "Causal Fairness",
    description:
      "The system does not perpetuate historical biases through causal pathways.",
    inDiet: null,
  },
];

type MitigationRow = {
  approach: string;
  stage: string;
  description: string;
  inDiet: string | null;
};

const MITIGATION_METHODS: MitigationRow[] = [
  {
    approach: "Pre-processing Data",
    stage: "Before training",
    description:
      "Identifying and addressing biases in the data before training. Techniques include oversampling, undersampling, synthetic data generation, and adversarial debiasing.",
    inDiet:
      "Phase 2 unlocks the portfolio feature \u2014 an equally-distributed axis that compensates for the skewed tech/experience distributions. This is analogous to dataset augmentation: enriching the feature space to reduce reliance on biased signals.",
  },
  {
    approach: "Model Selection",
    stage: "During training",
    description:
      "Using model selection methods that prioritize fairness, such as regularization or ensemble methods that penalize discriminatory predictions.",
    inDiet: null,
  },
  {
    approach: "Post-processing Decisions",
    stage: "After training",
    description:
      "Adjusting model output to achieve equalized odds \u2014 ensuring false positives and false negatives are equally distributed across groups.",
    inDiet: null,
  },
  {
    approach: "Transparency",
    stage: "Deployment",
    description:
      "Making the decision-making process visible and understandable to users.",
    inDiet:
      "The simulator is built around transparency: every decision is visualized in 2D scatter plots and a 3D manifold. The user directly manipulates the boundary and observes the consequences in real time.",
  },
  {
    approach: "Ongoing Monitoring",
    stage: "Post-deployment",
    description:
      "Continuously evaluating the system against new data to detect fairness drift.",
    inDiet:
      "The stress test demonstrates why this matters: a boundary that passes the audit on one cohort can fail on a fresh sample from the same population. Fairness is not a one-time fix.",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function BiasTable({ rows }: { rows: BiasRow[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Type of Bias</th>
            <th>Description</th>
            <th>In DIET</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.type} className={r.inDiet ? styles.rowActive : styles.rowInactive}>
              <td className={styles.cellType}>{r.type}</td>
              <td>{r.description}</td>
              <td>
                {r.inDiet ? (
                  <span className={styles.demonstrated}>
                    <span className={styles.badge}>Demonstrated</span>
                    {r.inDiet}
                  </span>
                ) : (
                  <span className={styles.notCovered}>Not covered</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FairnessTable({ rows }: { rows: FairnessRow[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Type of Fairness</th>
            <th>Description</th>
            <th>In DIET</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.type} className={r.inDiet ? styles.rowActive : styles.rowInactive}>
              <td className={styles.cellType}>{r.type}</td>
              <td>{r.description}</td>
              <td>
                {r.inDiet ? (
                  <span className={styles.demonstrated}>
                    <span className={styles.badge}>Applied</span>
                    {r.inDiet}
                  </span>
                ) : (
                  <span className={styles.notCovered}>Not covered</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MitigationTable({ rows }: { rows: MitigationRow[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Approach</th>
            <th>Stage</th>
            <th>Description</th>
            <th>In DIET</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.approach} className={r.inDiet ? styles.rowActive : styles.rowInactive}>
              <td className={styles.cellType}>{r.approach}</td>
              <td className={styles.cellStage}>{r.stage}</td>
              <td>{r.description}</td>
              <td>
                {r.inDiet ? (
                  <span className={styles.demonstrated}>
                    <span className={styles.badge}>Used</span>
                    {r.inDiet}
                  </span>
                ) : (
                  <span className={styles.notCovered}>Not implemented</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DebriefPhase() {
  return (
    <div className={phase.phase}>
      <p className={phase.lede}>
        You've built a classifier, audited it for fairness, and stress-tested it on unseen data.
        This page maps what you experienced back to the established taxonomy of AI bias and
        fairness — so the intuition you built has names you can use.
      </p>

      {/* Section 1: Types of Bias */}
      <section className={`${phase.panel} ${styles.section}`}>
        <p className={styles.eyebrow}>Part 1</p>
        <h2 className={styles.h2}>Types of AI Bias</h2>
        <p className={styles.body}>
          AI bias takes many forms. Some stem from the data, some from the algorithm, and some
          from the humans who build and use the system. The table below lists the major categories
          — and highlights which ones the simulator let you experience firsthand.
        </p>
        <BiasTable rows={BIAS_TYPES} />
      </section>

      {/* Section 2: Types of Fairness */}
      <section className={`${phase.panel} ${styles.section}`}>
        <p className={styles.eyebrow}>Part 2</p>
        <h2 className={styles.h2}>Fairness Definitions</h2>
        <p className={styles.body}>
          "Fairness" isn't a single concept — it's a family of formal criteria, each capturing
          a different intuition about what it means to treat people justly. No system can satisfy
          all of them simultaneously, so choosing which fairness definition to enforce is itself
          an ethical decision.
        </p>
        <FairnessTable rows={FAIRNESS_TYPES} />
      </section>

      {/* Section 3: Mitigation Methods */}
      <section className={`${phase.panel} ${styles.section}`}>
        <p className={styles.eyebrow}>Part 3</p>
        <h2 className={styles.h2}>Mitigation Techniques</h2>
        <p className={styles.body}>
          Bias mitigation can happen at every stage of the ML pipeline — before training, during
          model selection, after prediction, and throughout deployment. Each approach has trade-offs.
          The simulator demonstrates a few of these; the rest are included for reference.
        </p>
        <MitigationTable rows={MITIGATION_METHODS} />
      </section>

      {/* Takeaway */}
      <section className={`${phase.panel} ${styles.section} ${styles.takeaway}`}>
        <p className={styles.eyebrow}>Takeaway</p>
        <h2 className={styles.h2}>Fairness is a process, not a checkbox.</h2>
        <p className={styles.body}>
          Adding features helped. Tuning the boundary helped. But the stress test showed that a
          boundary passing the audit on one cohort doesn't guarantee fairness on the next. The
          misconception that "more features = more fair" or "passing the audit = done" is exactly
          what this simulator is designed to challenge.
        </p>
        <p className={styles.body} style={{ marginTop: 12 }}>
          Real-world fairness requires ongoing monitoring, domain expertise, stakeholder input,
          and a willingness to accept that trade-offs between accuracy and equity are inherent —
          not bugs to be optimized away.
        </p>
      </section>

      <div className={styles.continueBar}>
        <p className={styles.continueHint}>
          Return to the beginning or revisit any phase.
        </p>
        <Link to="/simulator/background" className={styles.continueBtn}>
          ← Back to Background
        </Link>
      </div>
    </div>
  );
}
