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

type ASTNode =
  | { type: "text"; content: string }
  | { type: "tajweed"; cls: string; id?: string; children: ASTNode[] };

function parseTajweed(text: string): ASTNode[] {
  const root: ASTNode[] = [];
  const stack: {
    node: { type: "tajweed"; cls: string; id?: string; children: ASTNode[] };
    startIdx: number;
  }[] = [];
  let currentChildren = root;

  let i = 0;
  while (i < text.length) {
    if (text[i] === "[") {
      const remaining = text.slice(i);
      const startMatch = remaining.match(/^\[([a-zA-Z]+)(?::(\d+))?\[/);
      if (startMatch) {
        const cls = startMatch[1];
        const id = startMatch[2] || undefined;

        const node: ASTNode = {
          type: "tajweed",
          cls,
          id,
          children: [],
        };

        currentChildren.push(node);
        stack.push({ node, startIdx: i });
        currentChildren = node.children;

        i += startMatch[0].length;
        continue;
      }
    }

    if (text[i] === "]" && stack.length > 0) {
      stack.pop();
      currentChildren =
        stack.length > 0 ? stack[stack.length - 1].node.children : root;
      i++;
      continue;
    }

    let textContent = "";
    while (i < text.length) {
      if (text[i] === "[") {
        const remaining = text.slice(i);
        if (remaining.match(/^\[([a-zA-Z]+)(?::(\d+))?\[/)) {
          break;
        }
      }
      if (text[i] === "]" && stack.length > 0) {
        break;
      }
      textContent += text[i];
      i++;
    }

    if (textContent) {
      currentChildren.push({ type: "text", content: textContent });
    }
  }

  return root;
}

const renderAST = (
  nodes: ASTNode[],
  keyPrefix: string,
  isInsideTajweed: boolean = false,
): React.ReactNode[] => {
  return nodes.map((node, idx) => {
    const key = `${keyPrefix}-${node.type}-${idx}`;
    if (node.type === "text") {
      if (isInsideTajweed) {
        return <React.Fragment key={key}>{node.content}</React.Fragment>;
      } else {
        return (
          <React.Fragment key={key}>
            {renderTextWithTafkhim(node.content, key)}
          </React.Fragment>
        );
      }
    } else {
      const cls = node.cls;
      return (
        <span key={key} className={`tajweed tajweed-${cls}`}>
          {renderAST(node.children, key, true)}
        </span>
      );
    }
  });
};

export function TajweedText({ text }: TajweedTextProps) {
  if (!text) return null;

  const ast = parseTajweed(text);
  return <span>{renderAST(ast, "root")}</span>;
}
