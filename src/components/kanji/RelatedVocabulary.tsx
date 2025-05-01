import { FC } from 'react';
import { Mark } from '../shared/Mark.tsx';
import { useRelatedVocabulary } from '../../hooks/useRelatedVocabulary.ts';

export const RelatedVocabulary: FC = () => {
  const relatedVocabulary = useRelatedVocabulary();

  return (
    relatedVocabulary.length > 0 && (
      <div className="flex gap-x-1 gap-y-4 flex-wrap justify-center">
        {relatedVocabulary.map((vocab) => (
          <div key={vocab.id}>
            <Mark vocabulary={vocab} />
          </div>
        ))}
      </div>
    )
  );
};
