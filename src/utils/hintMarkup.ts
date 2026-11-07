import { createElement, type ReactNode } from "react";

/**
 * Renders the small markup subset produced by formatHint as React nodes, without
 * dangerouslySetInnerHTML. Only mark/span/br survive (with their class attribute);
 * any other tag is dropped and its text kept. All text is escaped by React.
 */

const ALLOWED_TAGS = new Set(["mark", "span", "br"]);
const TAG_PATTERN =
  /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z-]+=(?:'[^']*'|"[^"]*"))*)\s*(\/?)>/g;
const CLASS_PATTERN = /\bclass=(?:'([^']*)'|"([^"]*)")/;

type Element = { tag: string; className?: string; children: HintNode[] };
export type HintNode = string | Element;

export const parseHintMarkup = (html: string): HintNode[] => {
  const root: Element = { tag: "root", children: [] };
  const stack: Element[] = [root];
  const top = () => stack[stack.length - 1];
  let position = 0;

  const pushText = (text: string) => {
    if (text) top().children.push(text);
  };

  for (const match of html.matchAll(TAG_PATTERN)) {
    const [raw, closing, name, attributes, selfClosing] = match;
    pushText(html.slice(position, match.index));
    position = match.index + raw.length;

    const tag = name.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) continue;

    if (closing) {
      const openIndex = stack.findLastIndex((element) => element.tag === tag);
      if (openIndex > 0) stack.length = openIndex;
      continue;
    }

    const classMatch = CLASS_PATTERN.exec(attributes);
    const element: Element = {
      tag,
      className: classMatch ? (classMatch[1] ?? classMatch[2]) : undefined,
      children: [],
    };
    top().children.push(element);
    if (tag !== "br" && !selfClosing) stack.push(element);
  }

  pushText(html.slice(position));
  return root.children;
};

export const hintNodesToReact = (nodes: HintNode[]): ReactNode[] =>
  nodes.map((node, index) => {
    if (typeof node === "string") return node;
    return createElement(
      node.tag,
      { key: index, className: node.className },
      ...hintNodesToReact(node.children),
    );
  });
