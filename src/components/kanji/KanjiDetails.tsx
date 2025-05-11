import { type FC } from 'react';
import KanaInput from '../shared/KanaInput.tsx';
import InfoTable from './InfoTable.tsx';
import { RelatedVocabulary } from './RelatedVocabulary.tsx';
import { ProgressBar } from '../shared/ProgressBar.tsx';
import { isKanji } from '../../utils/typeChecks.ts';
import useItems from '../../hooks/useItems.ts';
import MainTerm from '../shared/MainTerm.tsx';

const KanjiDetails: FC = () => {
  const { item } = useItems();
  const kanji = isKanji(item) ? item : null;

  return (
    kanji && (
      <div className="flex w-full flex-col items-center">
        <MainTerm />
        <ProgressBar />
        <KanaInput id="reading" />
        <RelatedVocabulary />
        <InfoTable />
      </div>
    )
  );
};

export default KanjiDetails;
