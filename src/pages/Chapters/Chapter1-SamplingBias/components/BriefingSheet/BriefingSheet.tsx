import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import InlineMarkup from "../../../../../components/InlineMarkup/InlineMarkup";
import styles from "./BriefingSheet.module.css";
import type { BriefingSheet as BriefingSheetData } from "../../types";

type BriefingSheetProps = {
  sheet: BriefingSheetData;
  children: ReactNode;
  spotlight?: boolean;
  spotlightLayout?: "stacked" | "split";
};

export default function BriefingSheet({ sheet, children, spotlight = false, spotlightLayout = "stacked" }: BriefingSheetProps) {
  const sheetRef = useRef<HTMLElement>(null);
  const className = `${styles.caseSheet} ${styles.caseSheetWide}${spotlight ? ` ${styles.caseSheetSpotlight}` : ""}${spotlight && spotlightLayout === "split" ? ` ${styles.caseSheetSpotlightSplit}` : ""}`;

  useEffect(() => {
    if (!spotlight) return;

    sheetRef.current?.focus({ preventScroll: true });
  }, [spotlight]);

  const sheetContent = (
    <section
      ref={sheetRef}
      className={className}
      tabIndex={spotlight ? -1 : undefined}
      role={spotlight ? "dialog" : undefined}
      aria-modal={spotlight ? true : undefined}
      aria-label="Detective case sheet"
    >
      <div className={styles.caseSheetClip} aria-hidden />
      <div className={styles.caseSheetScroll}>
        <div className={styles.caseSheetLandscape}>
          <div className={styles.caseSheetBrief}>
            <div className={styles.caseSheetHeader}>
              <p className={styles.caseSheetKicker}>New Eden Police Archive</p>
              <h2 className={styles.caseSheetTitle}>{sheet.title}</h2>
            </div>
            <p className={styles.caseSheetBody}>
              <InlineMarkup text={sheet.body} />
            </p>
            <div className={styles.caseSheetDivider} />
            <ul className={styles.caseSheetNotes}>
              {sheet.notes.map((note) => (
                <li key={note}>
                  <InlineMarkup text={note} />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.caseSheetExercise}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );

  if (spotlight) {
    return createPortal(
      <div className={styles.sheetPopupLayer}>
        {sheetContent}
      </div>,
      document.body
    );
  }

  return sheetContent;
}
