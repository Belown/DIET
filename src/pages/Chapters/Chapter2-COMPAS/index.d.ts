export default function Chapter2COMPAS(props?: {
  isActive?: boolean;
  onChapterComplete?: (result: { completed: boolean; passed: boolean; scoreLabel?: string }) => void;
}): JSX.Element;
