import { Mark } from '../shared/Mark.tsx';
import { KanjiItem } from '../../types';
import { FC } from 'react';

type RelatedVocabularyListProps = {
  relatedVocabulary: KanjiItem['vocabulary'];
};

export const RelatedVocabularyList: FC<RelatedVocabularyListProps> = ({ relatedVocabulary }) => {
  return (
    relatedVocabulary.length > 0 && (
      <div className="flex gap-x-1 gap-y-4 flex-wrap justify-center">
        {relatedVocabulary.map((vocab) => (
          <div key={vocab.word}>
            <Mark
              level={vocab.level}
              meaning={vocab.meaning}
              word={vocab.word}
              reading={vocab.reading}
            />
          </div>
        ))}
      </div>
    )
  );
};
