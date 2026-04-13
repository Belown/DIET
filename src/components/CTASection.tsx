import Button from "./Button";
import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <section className={styles.section}>
      <p className={`eyebrow ${styles.eyebrow}`}>One last thing</p>
      <h2 className={styles.title}>Curious yet?</h2>
      <p className={styles.sub}>
        No sign-up. No tutorial video. Just open the sandbox and start
        drawing lines.
      </p>
      <Button variant="primary" size="lg" href="#start">
        Start exploring
      </Button>
    </section>
  );
}
