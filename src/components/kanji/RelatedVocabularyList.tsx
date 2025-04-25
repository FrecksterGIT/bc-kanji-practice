import { Mark } from '../shared/Mark.tsx';
import { VocabularyItem } from '../../types';
import { FC } from 'react';

type RelatedVocabularyListProps = {
  relatedVocabulary: VocabularyItem[];
};

export const RelatedVocabularyList: FC<RelatedVocabularyListProps> = ({ relatedVocabulary }) => {
  return (
    relatedVocabulary.length > 0 && (
      <div className="flex gap-x-1 gap-y-4 flex-wrap justify-center">
        {relatedVocabulary.map((vocab) => {
          const reading =
            vocab.reading.find((r) => r.primary)?.reading ?? vocab.reading[0]?.reading;
          const meaning =
            vocab.meanings.find((m) => m.primary)?.meaning ?? vocab.meanings[0]?.meaning;

          return (
            <div key={vocab.id}>
              <Mark level={vocab.level} meaning={meaning} word={vocab.word} reading={reading} />
            </div>
          );
        })}
      </div>
    )
  );
};
