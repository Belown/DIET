import { useEffect, useState } from "react";
import styles from "./FairnessPoll.module.css";

const STORAGE_KEY = "chapter2_fairness_choice";

const OPTIONS = [
  {
    id: "northpointe",
    title: "Northpointe's definition",
    text: "equal recidivism rates across people flagged as 'high risk'",
  },
  {
    id: "propublica",
    title: "ProPublica's definition",
    text: "equal false positive and false negative rates",
  },
];

export default function FairnessPoll({ onConfirm }) {
  const [choice, setChoice] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setChoice(saved);
  }, []);

  const handleConfirm = () => {
    if (!choice) return;
    window.localStorage.setItem(STORAGE_KEY, choice);
    window.dispatchEvent(new CustomEvent("chapter2:fairness-choice", { detail: choice }));
    setConfirmed(true);
    onConfirm?.(choice);
  };

  return (
    <section className={styles.poll}>
      <h3 className={styles.title}>Which definition of fairness do you keep?</h3>
      <div className={styles.options}>
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`${styles.option} ${choice === option.id ? styles.optionActive : ""}`}
            onClick={() => setChoice(option.id)}
          >
            <strong>{option.title}</strong>
            <span>{option.text}</span>
          </button>
        ))}
      </div>
      {choice && !confirmed && (
        <button type="button" className={styles.confirm} onClick={handleConfirm}>
          Confirm
        </button>
      )}
      {confirmed && (
        <p className={styles.note}>Your choice has been noted. There's no objectively right answer here.</p>
      )}
    </section>
  );
}
