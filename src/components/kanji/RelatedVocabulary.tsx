import { FC } from 'react';
import { Mark } from './Mark.tsx';
import { useRelatedVocabulary } from '../../hooks/useRelatedVocabulary.ts';

export const RelatedVocabulary: FC = () => {
  const relatedVocabulary = useRelatedVocabulary();

  return (
    relatedVocabulary.length > 0 && (
      <div className="mb-8 flex w-full flex-wrap justify-center gap-x-1 gap-y-4">
        {relatedVocabulary.map((vocab) => (
          <Mark key={vocab.id} vocabulary={vocab} />
        ))}
      </div>
    )
  );
};
