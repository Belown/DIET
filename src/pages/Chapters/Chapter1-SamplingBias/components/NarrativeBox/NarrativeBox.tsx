import Chatbox, { type DialogueHistoryItem } from "../../../../../components/Chatbox/Chatbox";

interface NarrativeBoxProps {
  text: string;
  portraitSrc: string;
  history?: DialogueHistoryItem[];
  onHistorySelect?: (index: number) => void;
  onAdvance?: () => void;
  onTextComplete?: () => void;
  autoCollapseOnTextComplete?: boolean;
  autoCollapseDelayMs?: number;
  disableKeyboardAdvance?: boolean;
  disablePreviousNavigation?: boolean;
  forceOpen?: boolean;
}

export type { DialogueHistoryItem };

export default function NarrativeBox(props: NarrativeBoxProps) {
  return <Chatbox {...props} />;
}
