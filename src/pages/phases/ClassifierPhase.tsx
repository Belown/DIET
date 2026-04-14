import styles from "./Phase.module.css";

export default function ClassifierPhase() {
  return (
    <div className={styles.phase}>
      <p className={styles.lede}>
        This is where you'll draw the line. In phase one it's a 2D boundary on
        tech × experience; later phases unlock portfolio and extrude the
        whole thing into 3D.
      </p>
      <div className={styles.placeholder}>
        <p className={styles.placeholderK}>Coming next</p>
        <p className={styles.placeholderV}>
          Interactive 2D boundary canvas with slope + intercept controls.
        </p>
      </div>
    </div>
  );
}
