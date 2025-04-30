import { WanikaniKanjiSubject, WanikaniSubject } from '../types';

export function isKanji(item: WanikaniSubject): item is WanikaniKanjiSubject {
  return item.object === 'kanji';
}

export function isVocabulary(item: WanikaniSubject): item is WanikaniKanjiSubject {
  return item.object === 'vocabulary';
}

export function isRadical(item: WanikaniSubject): item is WanikaniKanjiSubject {
  return item.object === 'radical';
}

export function isKanaVocabulary(item: WanikaniSubject): item is WanikaniKanjiSubject {
  return item.object === 'kana_vocabulary';
}
