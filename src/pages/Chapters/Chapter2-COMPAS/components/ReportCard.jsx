import styles from "./ReportCard.module.css";

export default function ReportCard() {
  return (
    <article className={styles.reportCard}>
      <p className={styles.eyebrow}>ProPublica Study</p>
      <p className={styles.summary}>
        Analysis of COMPAS risk scores of ~7,000 people arrested in Florida in 2013 and 2014.
      </p>
      <ul className={styles.list}>
        <li>Only 20% of people predicted to commit violent crimes actually did so.</li>
        <li>For misdemeanors (e.g. driving with an expired license), the algorithm was just above 50% correct.</li>
        <li>Overall: of those deemed likely to re-offend, 61% were arrested for any subsequent crimes within two years.</li>
      </ul>
    </article>
  );
}
