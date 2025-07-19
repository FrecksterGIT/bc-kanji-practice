import { FC } from 'react';

type TermListEntryProps = {
  word: string;
  primary?: boolean;
};

export const TermListEntry: FC<TermListEntryProps> = ({ word, primary }) => {
  return (
    <span className={`separated-comma ${primary ? 'text-white' : ''}`}>
      <span className="text-nowrap">{word}</span>
    </span>
  );
};
