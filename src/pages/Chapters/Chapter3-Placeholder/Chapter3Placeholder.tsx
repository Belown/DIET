import styles from "./Chapter3Placeholder.module.css";

export default function Chapter3Placeholder() {
  return (
    <div className={styles.phase}>
      <div className={styles.placeholder}>
        <p className={styles.panelEyebrow}>Chapter 3 · Coming soon</p>
        <h2 className={styles.h2}>Change this.</h2>
        <p className={styles.panelBody}>
          TBD.
        </p>
        <span className={styles.tag}>In production</span>
      </div>
    </div>
  );
}
