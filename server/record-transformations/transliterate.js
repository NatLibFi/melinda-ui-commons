import _ from 'lodash';
import * as sfs4900 from 'sfs4900';
import iso9 from 'iso_9';

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
function fieldContainsCyrillicCharacters(field) {
  return field.subfields && field.subfields.map(sub => sub.value).some(containsCyrillicCharacters);
}

function shouldConvertField(field) {
  return field.tag !== '880' && fieldContainsCyrillicCharacters(field);
}
function shouldCreateTransliteratedFields(field) {
  return field.tag === '880' && fieldContainsCyrillicCharacters(field);
}

export function transliterate(record) {

  return new Promise((resolve) => {

    record.fields = record.fields.reduce((fields, field) => {

      if (shouldConvertField(field)) {

        const tagForLinking = field.tag;
        const linkNumber = getNextAvailableLinkNumber(_.concat(record.fields, fields));

        const origField = _.assign({}, field, {
          tag: '880'
        });
        origField.subfields.unshift({code: '6', value: `${tagForLinking}-${linkNumber}`});
       
        const isThereAlready = _.partial(fieldIsLessOrEqual, origField);
        if (record.fields.some(isThereAlready)) {
         
          fields.push(field);
        } else {
         
          fields.push(origField);  
        }
        
        
      } else {
        fields.push(field);  
      }
      return fields;
    }, []);

    const removeFields = [];

    record.fields = record.fields.reduce((fields, field) => {

      if (shouldCreateTransliteratedFields(field)) {
        
        const link = field.subfields.find(sub => sub.code === '6').value;
        const [linkedTag, linkNumber] = link.split('-');


        const sfs4900Transliterated = _.assign({}, field, {
          tag: '880',
          subfields: field.subfields
            .filter(sub => sub.code !== '6')
            .filter(sub => !(sub.code === '9' && sub.value.indexOf('<TRANS>') !== -1))
            .map(transliterateSubfield('sfs4900'))
        });
        sfs4900Transliterated.subfields.unshift({code: '6', value: `${linkedTag}-${linkNumber}`});
        sfs4900Transliterated.subfields.push({code: '9', value: 'SFS4900 <TRANS>'});
        
        const isThereAlready2 = _.partial(fieldIsLessOrEqual, sfs4900Transliterated);
        if (!record.fields.some(isThereAlready2)) {
          fields.push(sfs4900Transliterated);
        }


        const iso9Transliterated = {
          tag: linkedTag,
          ind1: field.ind1,
          ind2: field.ind2,
          subfields: field.subfields
            .filter(sub => sub.code !== '6')
            .filter(sub => !(sub.code === '9' && sub.value.indexOf('<TRANS>') !== -1))
            .map(transliterateSubfield('iso9'))
        };
        const iso9TransliteratedLinkSubField = {code: '6', value: `880-${linkNumber}`};
        iso9Transliterated.subfields.unshift(iso9TransliteratedLinkSubField);
        iso9Transliterated.subfields.push({code: '9', value: 'ISO9 <TRANS>'});

        const isThereAlready = _.partial(fieldIsLessOrEqual, iso9Transliterated);
        if (!record.fields.some(isThereAlready)) {
          fields.push(iso9Transliterated);

          record.fields
            .filter(field => field.tag == iso9Transliterated.tag)
            .filter(field => field.subfields.some(sub => _.isEqual(sub, iso9TransliteratedLinkSubField)))
            .forEach(field => {
              removeFields.push(field);    
            });
        }

      

        const cyrillicNoteSubField = {code: '9', value: 'CYRILLIC <TRANS>'};
        if (!field.subfields.some(sub => _.isEqual(sub, cyrillicNoteSubField))) {
          field.subfields.push(cyrillicNoteSubField);
        }
        
      }
      fields.push(field);

      return fields;
    }, []);

    record.fields = _.difference(record.fields, removeFields);

    record.fields = sortNumericFields(record.fields);
    resolve(record);


  });
}

function fieldIsLessOrEqual(fieldA, fieldB) {
  if (fieldA.tag !== fieldB.tag) return false;
  if (fieldA.ind1 !== fieldB.ind1) return false;
  if (fieldA.ind2 !== fieldB.ind2) return false;
  if (typeof fieldA.subfields !== typeof fieldB.subfields) return false;

  if (fieldA.subfields) {
    if (_.differenceWith(fieldA.subfields, fieldB.subfields, _.isEqual).length !== 0) return false;  
  } else {
    if (fieldA.value !== fieldB.value) return false;
  }
  
  return true;
}


function sortNumericFields(fields) {
  const nonNumericFields = fields.reduce((acc, field, i) => {
    if (isNaN(field.tag)) {
      acc.push({
        field: field,
        index: i
      });
    }
    return acc;
  }, []);

  const numericFields = _.without(fields, nonNumericFields.map(item => item.field));

  numericFields.sort((a, b) => {
    const byTag = parseInt(a.tag) - parseInt(b.tag);
    if (byTag !== 0) return byTag;
    const [aLinkedTag, ] = getLink(a);
    const [bLinkedTag, ] = getLink(b);

    const byLinkedFieldTag = parseInt(aLinkedTag) - parseInt(bLinkedTag);
    if (byLinkedFieldTag !== 0) return byLinkedFieldTag;

    const cyrillicFirst = fieldContainsCyrillicCharacters(b) ? 1 : -1;
    return cyrillicFirst;
  });

  nonNumericFields.forEach(item => {
    numericFields.splice(item.index, 0, item.field);
  });

  return numericFields;
}

function getNextAvailableLinkNumber(fields) {
  const currentLinkNumbers = _(fields)
    .flatMap(field => field.subfields)
    .filter(_.isObject)
    .filter(sub => sub.code === '6')
    .map(sub => sub.value)
    .map(link => _.last(link.split('-')))
    .value();

  const isTaken = (linkNumberPart) => {
    return currentLinkNumbers.some(used => used === linkNumberPart);
  };

  return _.range(1,100).map(num => _.padStart(num, 2, '0')).find(linkNumberPart => !isTaken(linkNumberPart));
}

function getLink(field) {
  const links = _.get(field, 'subfields', [])
    .filter(sub => sub.code === '6')
    .map(sub => sub.value)
    .map(link => link.split('-'));

  return _.head(links);
}

function transliterateSubfield(type) {
  return function(subfield) {
    const converted = type === 'sfs4900' ? sfs4900Convert(subfield.value) : iso9Convert(subfield.value);
    return _.assign({}, subfield, {value: converted.result });
  };
}

function sfs4900Convert(str) {
  return sfs4900.convertToLatin(str);
}

function iso9Convert(str) {
  return {
    result: iso9(str, 1)
  }; 
}