import styles from "./Phase.module.css";

export default function EvaluationPhase() {
  return (
    <div className={styles.phase}>
      <p className={styles.lede}>
        Once you've picked a boundary, we audit it: overall accuracy, true
        positive rate per group, and the gap between them. If the gap is more
        than 5%, this panel turns red.
      </p>
      <div className={styles.placeholder}>
        <p className={styles.placeholderK}>Coming next</p>
        <p className={styles.placeholderV}>
          Live metrics panel with accuracy, TPR<sub>A</sub>, TPR<sub>B</sub>,
          and the fairness gap.
        </p>
      </div>
    </div>
  );
}
