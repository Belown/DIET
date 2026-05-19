import styles from "./ChoiceList.module.css";
import type { Choice, PassageId } from "../../staticPassages";

interface ChoiceListProps {
  choices: Choice[];
  onSelect?: (nextPassage: PassageId, action?: () => void) => void;
}

export default function ChoiceList({ choices, onSelect }: ChoiceListProps) {
  return (
    <div className={styles.list} role="group" aria-label="Choices">
      {choices.map((choice, i) => (
        <button
          key={`${choice.nextPassage}-${i}`}
          type="button"
          className={styles.choice}
          style={{ animationDelay: `${i * 50}ms` }}
          onClick={() => onSelect?.(choice.nextPassage, choice.action)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
