export const formatHint = (hint: string | null) => {
  if (!hint) {
    return '';
  }
  return hint
    .replaceAll('<reading>', "<mark class='bg-gray-500 text-gray-700 px-1 rounded-sm mx-1'>")
    .replaceAll('</reading>', '</mark>')
    .replaceAll('<kanji>', "<mark class='bg-pink-400 text-gray-700 px-1 rounded-sm mx-1'>")
    .replaceAll('</kanji>', '</mark>')
    .replaceAll('<radical>', "<mark class='bg-blue-300 text-gray-700 px-1 rounded-sm mx-1'>")
    .replaceAll('</radical>', '</mark>')
    .replaceAll('<vocabulary>', "<mark class='bg-purple-400 text-gray-700 px-1 rounded-sm mx-1'>")
    .replaceAll('</vocabulary>', '</mark>');
};
