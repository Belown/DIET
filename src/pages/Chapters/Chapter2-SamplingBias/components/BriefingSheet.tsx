import type { ReactNode } from "react";
import styles from "../Chapter2SamplingBias.module.css";
import type { BriefingSheet as BriefingSheetData } from "../types";

type BriefingSheetProps = {
  sheet: BriefingSheetData;
  children: ReactNode;
};

export default function BriefingSheet({ sheet, children }: BriefingSheetProps) {
  return (
    <section className={`${styles.caseSheet} ${styles.caseSheetWide}`} aria-label="Detective case sheet">
      <div className={styles.caseSheetClip} aria-hidden />
      <div className={styles.caseSheetLandscape}>
        <div className={styles.caseSheetBrief}>
          <div className={styles.caseSheetHeader}>
            <p className={styles.caseSheetKicker}>New Eden Police Archive</p>
            <h2 className={styles.caseSheetTitle}>{sheet.title}</h2>
          </div>
          <p className={styles.caseSheetBody}>{sheet.body}</p>
          <div className={styles.caseSheetDivider} />
          <ul className={styles.caseSheetNotes}>
            {sheet.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>

        <div className={styles.caseSheetExercise}>
          {children}
        </div>
      </div>
    </section>
  );
}
