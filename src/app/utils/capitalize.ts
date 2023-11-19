export default function capitalize(phrase: string, commas: boolean = false, remove_duplicates: boolean = false) {
  const ignored_words = [
    'e',
    'de',
    'da',
    'do',
    'das',
    'dos',
    'em',
    'no',
    'na',
    'nos',
    'nas',
    'por',
    'para',
    'com',
    'sem',
    'sob',
    'sobre',
    'ante',
    'apos',
    'até',
    'ate',
    'contra',
    'desde',
    'entre',
    'perante',
    'pro',
    'pelo',
    'pela',
    'pelos',
    'pelas',
    'perante',
    'per',
    'pra',
    'prá',
    'pros',
    'pras',
    'segundo',
    'sem',
    'sob',
    'sobre',
    'tras',
    'trás',
    'a',
    'o',
    'as',
    'os',
    'à',
    'às',
    'ao',
    'aos',
    'um',
    'uns',
    'uma',
    'umas',
    'me',
    'te',
    'se',
    'nos',
    'vos',
    'lhe',
    'lhes',
    'lha',
    'lhas',
  ];

  const separator = commas ? ', ' : ' ';

  let words = phrase
    .toLowerCase()
    .split(new RegExp(`${commas ? ', ' : ' '}`))
    .filter((word, index, array) => !remove_duplicates || array.indexOf(word) === index);

  const capitalized_phrase = words
    .map((word, index) => {
      if (index === 0 || !ignored_words.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        return word;
      }
    })
    .join(separator);

  /* const capitalized_phrase = phrase
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !ignored_words.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        return word;
      }
    })
    .join(' ');

  return capitalized_phrase; */
}
