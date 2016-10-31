
const cyrillicCharacters = [
  'А', 'а', 'Б', 'б', 'В', 'в', 'Г', 'г', 'Д', 'д', 'Е', 'е', 'Ё', 'ё', 'Ж', 
  'ж', 'З', 'з', 'И', 'и', 'И', 'и', 'Й', 'й', 'Й', 'й', 'Й', 'й', 'К', 'к', 'Л', 'л', 'М', 'м', 
  'Н', 'н', 'О', 'о', 'П', 'п', 'Р', 'р', 'С', 'с', 'Т', 'т', 'У', 'у', 'Ф', 'ф', 'Х', 'х', 'Ц', 
  'ц', 'Ч', 'ч', 'Ш', 'ш', 'Щ', 'щ', 'Ъ', 'ъ', 'Ы', 'ы', 'Ь', 'ь', 'Э', 'э', 'Ю', 'ю', 'Я', 'я'
];

function isCyrillicCharacter(char) {
  return cyrillicCharacters.some(cyrillicCharacter => cyrillicCharacter === char);
}

function containsCyrillicCharacters(str) {
  return str.split('').some(isCyrillicCharacter);
}



function shouldConvertField(field) {

  return field.subfields && field.subfields.map(sub => sub.value).some(containsCyrillicCharacters);
}

export function transliterate(record, opts) {

  return new Promise((resolve, reject) => {

    record.fields = record.fields.map(field => {
      if (shouldConvertField(field)) {
        if (field.tag === '100') {
          field.tag = '880';
        }
      }
      return field;
    });

    resolve(record);

  });

}
