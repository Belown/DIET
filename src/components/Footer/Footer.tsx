import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>Θmen — A Fairness Simulator</span>
      <span className={styles.meta}>ETHZ-DIET · 2026</span>
    </footer>
  );
}
