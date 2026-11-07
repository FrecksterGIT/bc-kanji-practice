import { FC, useMemo } from "react";
import { hintNodesToReact, parseHintMarkup } from "../../utils/hintMarkup.ts";

type HtmlParagraphProps = {
  className?: string;
  children: string;
};

/** Renders formatHint markup as React nodes; no raw HTML is injected. */
export const HtmlParagraph: FC<HtmlParagraphProps> = ({ className, children }) => {
  const nodes = useMemo(() => hintNodesToReact(parseHintMarkup(children)), [children]);
  return <p className={className}>{nodes}</p>;
};
