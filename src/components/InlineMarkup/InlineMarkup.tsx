import type { ReactNode } from "react";

const INLINE_TAGS = new Set(["b", "i", "red", "u"]);

type InlineStyle = {
  bold: boolean;
  italic: boolean;
  red: boolean;
  underline: boolean;
};

type InlineSegment = {
  text: string;
  style: InlineStyle;
};

type InlineMarkupProps = {
  text: string;
  maxVisibleChars?: number;
};

const stylesMatch = (a: InlineStyle, b: InlineStyle) =>
  a.bold === b.bold && a.italic === b.italic && a.red === b.red && a.underline === b.underline;

const currentInlineStyle = (tagStack: string[]): InlineStyle => ({
  bold: tagStack.includes("b"),
  italic: tagStack.includes("i"),
  red: tagStack.includes("red"),
  underline: tagStack.includes("u"),
});

const parseInlineMarkup = (value: string, maxVisibleChars = Number.POSITIVE_INFINITY): InlineSegment[] => {
  const segments: InlineSegment[] = [];
  const tagStack: string[] = [];
  let index = 0;
  let visibleChars = 0;

  const pushText = (text: string) => {
    if (!text) return;

    const style = currentInlineStyle(tagStack);
    const previous = segments[segments.length - 1];

    if (previous && stylesMatch(previous.style, style)) {
      previous.text += text;
      return;
    }

    segments.push({ text, style });
  };

  while (index < value.length && visibleChars < maxVisibleChars) {
    if (value[index] === "<") {
      const tagMatch = value.slice(index).match(/^<\/?([a-z]+)>/i);
      const tagName = tagMatch?.[1].toLowerCase();

      if (tagMatch && tagName && INLINE_TAGS.has(tagName)) {
        const isClosingTag = tagMatch[0][1] === "/";

        if (isClosingTag) {
          const matchingIndex = tagStack.lastIndexOf(tagName);
          if (matchingIndex >= 0) {
            tagStack.splice(matchingIndex, 1);
          }
        } else {
          tagStack.push(tagName);
        }

        index += tagMatch[0].length;
        continue;
      }
    }

    const char = Array.from(value.slice(index))[0];
    pushText(char);
    visibleChars += 1;
    index += char.length;
  }

  return segments;
};

export const getInlineMarkupVisibleLength = (value: string) =>
  parseInlineMarkup(value).reduce((total, segment) => total + Array.from(segment.text).length, 0);

const renderSegmentText = (segment: InlineSegment): ReactNode => {
  let content: ReactNode = segment.text;

  if (segment.style.underline) {
    content = <u>{content}</u>;
  }

  if (segment.style.italic) {
    content = <em>{content}</em>;
  }

  if (segment.style.bold) {
    content = <strong>{content}</strong>;
  }

  if (segment.style.red) {
    content = <span style={{ color: "var(--diet-stamp-red, #e61e49)" }}>{content}</span>;
  }

  return content;
};

export default function InlineMarkup({ text, maxVisibleChars }: InlineMarkupProps) {
  return (
    <>
      {parseInlineMarkup(text, maxVisibleChars).map((segment, index) => (
        <span key={`${index}-${segment.text}`}>{renderSegmentText(segment)}</span>
      ))}
    </>
  );
}
