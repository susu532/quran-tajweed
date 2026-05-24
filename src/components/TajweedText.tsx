import React from "react";

interface TajweedTextProps {
  text: string;
}

const renderTextWithTafkhim = (text: string, keyPrefix: string) => {
  const tafkhimRegex = /([خصضطظغق]\p{M}*)/gu;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = tafkhimRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <span key={`${keyPrefix}-norm-${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>,
      );
    }
    elements.push(
      <span
        key={`${keyPrefix}-taf-${match.index}`}
        className="tajweed tajweed-tafkhim"
      >
        {match[1]}
      </span>,
    );
    lastIndex = tafkhimRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(
      <span key={`${keyPrefix}-norm-${lastIndex}`}>
        {text.slice(lastIndex)}
      </span>,
    );
  }
  return elements;
};

export function TajweedText({ text }: TajweedTextProps) {
  if (!text) return null;

  // Render text containing tags like `[h:1[ٱ]` or `[l[ل]`
  const regex = /\[([a-zA-Z]+)(?::\d+)?\[(.*?)\]/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // text before the match
    if (match.index > lastIndex) {
      elements.push(
        <span key={`text-${lastIndex}`}>
          {renderTextWithTafkhim(
            text.slice(lastIndex, match.index),
            `pre-${lastIndex}`,
          )}
        </span>,
      );
    }

    // the tajweed match
    const cls = match[1];
    const content = match[2];

    elements.push(
      <span key={`match-${match.index}`} className={`tajweed tajweed-${cls}`}>
        {/* Do not process Tafkhim inside explicit Tajweed tags as they override colors */}
        {content}
      </span>,
    );

    lastIndex = regex.lastIndex;
  }

  // remaining text
  if (lastIndex < text.length) {
    elements.push(
      <span key={`text-${lastIndex}`}>
        {renderTextWithTafkhim(text.slice(lastIndex), `post-${lastIndex}`)}
      </span>,
    );
  }

  return <span>{elements}</span>;
}
