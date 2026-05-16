import Chatbox, { type DialogueHistoryItem } from "../../../../../components/Chatbox/Chatbox";

interface NarrativeBoxProps {
  text: string;
  portraitSrc: string;
  history?: DialogueHistoryItem[];
  onHistorySelect?: (index: number) => void;
  onAdvance?: () => void;
  onSkipToImportantInstruction?: () => void;
  onTextComplete?: () => void;
  autoCollapseOnTextComplete?: boolean;
  disableKeyboardAdvance?: boolean;
  disablePreviousNavigation?: boolean;
  forceOpen?: boolean;
  reopenSignal?: number;
}

export type { DialogueHistoryItem };

export default function NarrativeBox(props: NarrativeBoxProps) {
  return <Chatbox {...props} />;
}
