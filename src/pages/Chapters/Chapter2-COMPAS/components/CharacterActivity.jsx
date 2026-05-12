import { useMemo, useState } from "react";
import styles from "./CharacterActivity.module.css";

const CHARACTERS = [
  {
    id: "marcus",
    name: "Marcus",
    race: "Black",
    tone: "threat",
    risk: "High Recidivism Risk",
    rate: 28.0,
    metric: "False Negative Rate",
    line: "Hello, my name is Marcus, and I am a threat to society! The probability that I'm not flagged as a high-risk criminal is 28.0%. Booo!",
  },
  {
    id: "darnell",
    name: "Darnell",
    race: "Black",
    tone: "friendly",
    risk: "Low Recidivism Risk",
    rate: 44.9,
    metric: "False Positive Rate",
    line: "Hello, my name is Darnell, and I am practically an angel on earth! The probability that I'm falsely flagged as a high-risk criminal is 44.9%. Can you believe it?",
  },
  {
    id: "tyler",
    name: "Tyler",
    race: "White",
    tone: "threat",
    risk: "High Recidivism Risk",
    rate: 47.7,
    metric: "False Negative Rate",
    line: "Hello, my name is Tyler, and I am a threat to society! The probability that I'm not flagged as a high-risk criminal is 47.7%. That sounds great to me!",
  },
  {
    id: "connor",
    name: "Connor",
    race: "White",
    tone: "friendly",
    risk: "Low Recidivism Risk",
    rate: 23.5,
    metric: "False Positive Rate",
    line: "Hello, my name is Connor, and I am practically an angel on earth! The probability that I'm falsely flagged as a high-risk criminal is 23.5%.",
  },
];

export default function CharacterActivity({ onClose }) {
  const [revealed, setRevealed] = useState({});
  const [animatingId, setAnimatingId] = useState(null);

  const allRevealed = useMemo(() => CHARACTERS.every((c) => revealed[c.id]), [revealed]);

  const handleReveal = (id) => {
    if (animatingId || revealed[id]) return;
    setAnimatingId(id);
    window.setTimeout(() => {
      setRevealed((prev) => ({ ...prev, [id]: true }));
      setAnimatingId(null);
    }, 700);
  };

  return (
    <section className={styles.activity}>
      <h3 className={styles.title}>Click on each person to learn their story.</h3>
      <div className={styles.grid}>
        {CHARACTERS.map((char) => {
          const isOpen = Boolean(revealed[char.id]);
          const isDisabled = Boolean(animatingId && animatingId !== char.id);
          return (
            <button
              type="button"
              key={char.id}
              className={[
                styles.card,
                styles[char.tone],
                isOpen ? styles.revealed : "",
                isDisabled ? styles.disabled : "",
                animatingId === char.id ? styles.animating : "",
              ].filter(Boolean).join(" ")}
              onClick={() => handleReveal(char.id)}
              disabled={isOpen || isDisabled}
            >
              <div className={styles.cardHeader}>
                <strong>{char.name}</strong>
                <span>{char.risk}</span>
              </div>
              {!isOpen ? (
                <p className={styles.cardHint}>{char.race} defendant</p>
              ) : (
                <div className={styles.revealBody}>
                  <div
                    className={styles.pie}
                    style={{ background: `conic-gradient(var(--rui-blue) ${char.rate}%, rgba(25, 28, 31, 0.16) ${char.rate}% 100%)` }}
                    aria-hidden
                  />
                  <p className={styles.metric}>{char.metric}: {char.rate.toFixed(1)}%</p>
                  <p className={styles.bubble}>{char.line}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {allRevealed && !animatingId && (
        <button type="button" className={styles.closeButton} onClick={onClose}>
          Continue
        </button>
      )}
    </section>
  );
}
