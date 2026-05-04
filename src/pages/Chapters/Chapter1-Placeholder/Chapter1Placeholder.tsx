import styles from "./Chapter1Placeholder.module.css";

export default function Chapter1Placeholder() {
  return (
    <div className={styles.phase}>
      <div className={styles.placeholder}>
        <p className={styles.panelEyebrow}>Chapter 1 · Coming soon</p>
        <h2 className={styles.h2}>Change this.</h2>
        <p className={styles.panelBody}>
          TBD.
        </p>
        <span className={styles.tag}>In production</span>
      </div>
    </div>
  );
}
