import {
  WanikaniAssignment,
  WanikaniKanaVocabularySubject,
  WanikaniKanjiSubject,
  WanikaniSubject,
  WanikaniVocabularySubject,
} from '../wanikani';

const isT = (item: unknown, type: string | string[]): item is { object: string } =>
  typeof item === 'object' &&
  item !== null &&
  'object' in item &&
  (item.object === type || type.includes(String(item.object)));

export const isKanji = (item?: unknown): item is WanikaniKanjiSubject => isT(item, 'kanji');

export const isVocabulary = (item?: unknown): item is WanikaniVocabularySubject =>
  isT(item, 'vocabulary');

export const isKanaVocabulary = (item?: unknown): item is WanikaniKanaVocabularySubject =>
  isT(item, 'kana_vocabulary');

export const isSubject = (item?: unknown): item is WanikaniSubject =>
  isT(item, ['kanji', 'vocabulary', 'kana_vocabulary']);

export const isSubjectList = (item?: unknown): item is WanikaniSubject[] =>
  Array.isArray(item) && item.every(isSubject);

export const isAssignment = (item?: unknown): item is WanikaniAssignment => isT(item, 'assignment');

export const isAssignmentList = (item?: unknown): item is WanikaniAssignment[] =>
  Array.isArray(item) && item.every(isAssignment);
