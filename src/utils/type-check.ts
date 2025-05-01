import {
  WanikaniAssignment,
  WanikaniKanaVocabularySubject,
  WanikaniKanjiSubject,
  WanikaniSubject,
  WanikaniVocabularySubject,
} from '../types';

export function isKanji(item?: WanikaniSubject): item is WanikaniKanjiSubject {
  return item?.object === 'kanji';
}

export function isVocabulary(item?: WanikaniSubject): item is WanikaniVocabularySubject {
  return item?.object === 'vocabulary';
}

export function isKanaVocabulary(item?: WanikaniSubject): item is WanikaniKanaVocabularySubject {
  return item?.object === 'kana_vocabulary';
}

export function isSubject(item?: unknown): item is WanikaniSubject {
  return (
    typeof item === 'object' &&
    item !== null &&
    'object' in item &&
    ['kanji', 'vocabulary', 'kana_vocabulary'].includes((item as WanikaniSubject).object)
  );
}

export function isSubjectList(item?: unknown): item is WanikaniSubject[] {
  return Array.isArray(item) && item.every(isSubject);
}

export function isAssignment(item?: unknown): item is WanikaniAssignment {
  return (
    typeof item === 'object' &&
    item !== null &&
    'object' in item &&
    (item as WanikaniAssignment).object === 'assignment'
  );
}

export function isAssignmentList(item?: unknown): item is WanikaniAssignment[] {
  return Array.isArray(item) && item.every(isAssignment);
}
