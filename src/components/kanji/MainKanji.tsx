import { type FC } from 'react';
import List from '../shared/List.tsx';
import Details from './Details.tsx';

const MainKanji: FC = () => {
  return (
    <>
      <Details />
      <List type="kanji" />
    </>
  );
};

export default MainKanji;
