import styles from "./HowSection.module.css";

type Step = {
  num: string;
  title: string;
  body: string;
  accent: "blue" | "pink" | "teal";
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Meet the data",
    body: "Open the dataset and see who's in it, who's underrepresented, and which patterns the model is about to learn from history. Spoiler: the data is never clean.",
    accent: "blue",
  },
  {
    num: "02",
    title: "Draw the line",
    body: "Tune a 2D decision boundary by hand. Chase accuracy. Hit 85%. Feel good for exactly one second — before the Equal Opportunity audit comes back red.",
    accent: "pink",
  },
  {
    num: "03",
    title: "Unlock the third axis",
    body: "Extrude your curves into a rotatable 3D decision manifold and find the surface where both groups actually get a fair shot. Break it. Rotate it. Learn why one feature is never enough.",
    accent: "teal",
  },
];

export default function HowSection() {
  return (
    <section className={styles.section} id="how">
      <p className="eyebrow">Three things you'll do</p>
      <h2 className="section__title section__title--dark">
        Three phases.<br />One manifold.
      </h2>

      <div className={styles.cards}>
        {STEPS.map((s) => (
          <article
            className={`${styles.card} ${styles[`accent_${s.accent}`]}`}
            key={s.num}
          >
            <div className={styles.num}>{s.num}</div>
            <h3 className={styles.title}>{s.title}</h3>
            <p className={styles.body}>{s.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
