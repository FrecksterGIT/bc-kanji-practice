import { type FC } from 'react';
import List from '../shared/List.tsx';
import Details from './Details.tsx';

const MainVocabulary: FC = () => {
  return (
    <>
      <Details />
      <List type="vocabulary" />
    </>
  );
};

export default MainVocabulary;
