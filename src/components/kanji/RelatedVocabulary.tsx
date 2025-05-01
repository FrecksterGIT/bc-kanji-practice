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
            <Mark
              level={vocab.data.level}
              meaning={vocab.data.meanings[0].meaning}
              word={vocab.data.characters}
              reading={vocab.data.readings[0].reading}
            />
          </div>
        ))}
      </div>
    )
  );
};
