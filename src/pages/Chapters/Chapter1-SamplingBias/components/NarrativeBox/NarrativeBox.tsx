import Chatbox, { type DialogueHistoryItem } from "../../../../../components/Chatbox/Chatbox";

interface NarrativeBoxProps {
  text: string;
  portraitSrc: string;
  history?: DialogueHistoryItem[];
  onHistorySelect?: (index: number) => void;
  onAdvance?: () => void;
  disableKeyboardAdvance?: boolean;
}

export type { DialogueHistoryItem };

export default function NarrativeBox(props: NarrativeBoxProps) {
  return <Chatbox {...props} />;
}
