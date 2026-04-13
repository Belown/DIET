import styles from "./ConceptSection.module.css";

export default function ConceptSection() {
  return (
    <section className={styles.section} id="concept">
      <div className={styles.inner}>
        <p className="eyebrow eyebrow--light">The short version</p>
        <h2 className="section__title">
          An accurate model isn't<br />the same thing as a fair one.
        </h2>
        <p className={styles.lede}>
          Your ML class probably frames models as math: loss functions,
          gradients, accuracy scores. This is the other half of the story
          — where those numbers land on actual people, and where two
          candidates with identical qualifications can walk away with very
          different outcomes. We'll show you, not tell you.
        </p>
      </div>
    </section>
  );
}
