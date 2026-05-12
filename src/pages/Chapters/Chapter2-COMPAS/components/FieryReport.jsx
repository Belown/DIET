import { useEffect } from "react";
import styles from "./FieryReport.module.css";

export default function FieryReport({ onReady }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onReady?.(), 1300);
    return () => window.clearTimeout(timer);
  }, [onReady]);

  return (
    <article className={styles.fireCard}>
      <h3 className={styles.title}>⚠️ Problem Report</h3>
      <ul className={styles.list}>
        <li>More Black defendants than White defendants are classified as high or medium risk.</li>
        <li>Historically: Black defendants were twice as likely to be classified as medium or high risk (42% vs 22%).</li>
      </ul>
    </article>
  );
}
