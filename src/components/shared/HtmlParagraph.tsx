import { FC } from "react";

type HtmlParagraphProps = {
  className?: string;
  children: string;
};

export const HtmlParagraph: FC<HtmlParagraphProps> = ({ className, children }) => (
  <p className={className} dangerouslySetInnerHTML={{ __html: children }} />
);
