import { type FC } from 'react';
import { KanaInput } from '../shared/KanaInput.tsx';
import { InfoTable } from './InfoTable.tsx';
import { ProgressBar } from '../shared/ProgressBar.tsx';
import { isKanaVocabulary, isVocabulary } from '../../utils/typeChecks.ts';
import { useItems } from '../../hooks/useItems.ts';
import { MainTerm } from '../shared/MainTerm.tsx';
import { ContextSentences } from './ContextSentences.tsx';

export const VocabularyDetails: FC = () => {
  const { currentItem } = useItems();
  const vocabulary =
    isVocabulary(currentItem) || isKanaVocabulary(currentItem) ? currentItem : null;

  return (
    vocabulary && (
      <div className="flex w-full flex-col items-center">
        <MainTerm />
        <ProgressBar />
        <KanaInput id="reading" />
        <ContextSentences context_sentences={vocabulary.data.context_sentences} />
        <InfoTable />
      </div>
    )
  );
};
