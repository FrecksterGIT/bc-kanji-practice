import { isJapanese } from 'wanakana';

export const formatHint = (hint: string | null) =>
  hint
    ?.split('')
    .map((c) => (isJapanese(c) ? `<span class='font-semibold text-gray-300'>${c}</span>` : c))
    .join('')
    .replace(/(\n)+/g, '<br />')
    .replace(/rendaku/gi, "<span class='text-gray-300'>rendaku</span>")
    .replaceAll('<reading>', "<mark class='bg-gray-500 text-gray-800 px-1 rounded-sm mx-1'>")
    .replaceAll('</reading>', '</mark>')
    .replaceAll('<kanji>', "<mark class='bg-pink-500 text-gray-800 px-1 rounded-sm mx-1'>")
    .replaceAll('</kanji>', '</mark>')
    .replaceAll('<radical>', "<mark class='bg-blue-300 text-gray-800 px-1 rounded-sm mx-1'>")
    .replaceAll('</radical>', '</mark>')
    .replaceAll('<vocabulary>', "<mark class='bg-purple-500 text-gray-800 px-1 rounded-sm mx-1'>")
    .replaceAll('</vocabulary>', '</mark>') ?? '';
