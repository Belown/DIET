import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>Manifold — A Fairness Simulator</span>
      <span className={styles.meta}>A teaching prototype · 2026</span>
    </footer>
  );
}
