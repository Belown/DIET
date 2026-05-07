import { useState } from "react";
import styles from "./CycleDiagram.module.css";

const STAGES = [
  {
    emoji: "🏘️",
    title: "Historical discrimination against Black Americans",
    desc: "More police deployed to majority-Black neighbourhoods",
  },
  {
    emoji: "👮",
    title: "More police presence",
    desc: "More arrests in these neighbourhoods",
  },
  {
    emoji: "📋",
    title: "More arrests",
    desc: "More data suggesting these neighbourhoods are 'high crime'",
  },
  {
    emoji: "🔄",
    title: "Perceived high crime rate",
    desc: "Justifies deploying even more police forces, completing the cycle",
  },
];

export default function CycleDiagram() {
  const [step, setStep] = useState(0);
  const canAdvance = step < STAGES.length;

  return (
    <section className={styles.cycle}>
      <div className={styles.ring}>
        {STAGES.map((stage, idx) => (
          <article
            key={stage.title}
            className={`${styles.node} ${styles[`node${idx + 1}`]} ${step > idx ? styles.nodeVisible : ""}`}
          >
            <h4>{stage.emoji} {stage.title}</h4>
            <p>{stage.desc}</p>
          </article>
        ))}
        {step >= STAGES.length && <div className={styles.loopArrow} aria-hidden>↺</div>}
      </div>

      {canAdvance ? (
        <button type="button" className={styles.next} onClick={() => setStep((s) => s + 1)}>
          Next →
        </button>
      ) : (
        <p className={styles.finalText}>
          This is how algorithmic bias and historical discrimination create a self-perpetuating cycle.
        </p>
      )}
    </section>
  );
}
