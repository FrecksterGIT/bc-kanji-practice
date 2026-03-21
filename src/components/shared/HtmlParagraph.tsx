import { FC } from 'react';

type HtmlParagraphProps = {
  className?: string;
  children: string;
};

export const HtmlParagraph: FC<HtmlParagraphProps> = ({ className, children }) => (
  // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml
  <p className={className} dangerouslySetInnerHTML={{ __html: children }} />
);
