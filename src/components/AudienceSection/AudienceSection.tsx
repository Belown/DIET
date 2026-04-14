import styles from "./AudienceSection.module.css";

const TAKEAWAYS = [
  {
    k: "You'll leave with",
    v: "A clear intuition for why Overall Accuracy and Equal Opportunity can point in opposite directions — and the math to back it up.",
  },
  {
    k: "You'll leave with",
    v: "A felt understanding of why relying on a single feature quietly enforces inequality — and concrete ways to push back.",
  },
  {
    k: "You'll leave with",
    v: "Questions you didn't have before. The good kind. The kind you bring to your next ML lecture.",
  },
];

export default function AudienceSection() {
  return (
    <section className={styles.section} id="audience">
      <div className={styles.left}>
        <p className="eyebrow">Why bother?</p>
        <h2 className={`section__title section__title--dark ${styles.title}`}>
          Because your<br />first model<br />won't be neutral.
        </h2>
        <p className={styles.sub}>
          Built for CS and data science students who've been taught to
          chase accuracy, and are starting to wonder what that costs.
        </p>
      </div>
      <div className={styles.right}>
        <ul className={styles.goals}>
          {TAKEAWAYS.map((g, i) => (
            <li key={i}>
              <span className={styles.goalK}>{g.k}</span>
              <span className={styles.goalV}>{g.v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
