/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Common modules for Melinda UI applications
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-ui-commons
*
* melinda-ui-commons program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-ui-commons is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/
import _ from 'lodash';
import * as sfs4900 from 'sfs4900';
import * as iso9 from 'iso9_1995';
import uuid from 'node-uuid';
import { isDataField } from '../record-utils';
import MarcRecord from 'marc-record-js';
import XRegExp from 'xregexp';

const defaultOptions = {
  doSFS4900RusTransliteration: true
};

export function transliterate(record, options) {

  options = _.assign({}, defaultOptions, options);

  record.fields.forEach(field => {
    if (field.uuid === undefined) {
      field.uuid = uuid.v4();
    }
  });

  return new Promise((resolve) => {

    const originalRecord = new MarcRecord(record);

    const fields = record.fields;

    record.fields = transformFields(options, fields);

    const warnings = checkForWarnings(originalRecord, record);

    record.fields = removeFailedTransliterations(record.fields);

    resolve({record, warnings});

  });
}

function transformFields(options, fields) {

  const transliterate880Fields = _.partial(createTransliteratedFieldsFrom880, options);

  const transformComposition = _.flow(
    (fields) => fields.map(normalizeField), // normalize link subfields etc.
    moveCyrillicFieldsTo880,                // move fields with cyrillic content to 880
    transliterate880Fields,                 // create transliterated fields for every cyrillic 880
    sortNumericFields                       // new fields were added, so they need to be sorted
  );

  return transformComposition(fields);
}


function shouldCreateTransliteratedFields(field) {
  return field.tag === '880' && fieldContainsCyrillicCharacters(field);
}

function removeFailedTransliterations(fieldList) {
  const isSFSTransliteratedField = hasSubfieldValue(9, 'SFS4900 <TRANS>');

  return fieldList
    .filter(field => {
      const failedSFS4900Transliteration = isSFSTransliteratedField(field) && fieldContainsCyrillicCharacters(field);
      return !failedSFS4900Transliteration;
    });

}

function hasSubfieldValue(expectedCode, expectedValue) {
  const expectedSubfieldCodeStr = expectedCode.toString();
  return function(field) {
    return field.subfields && field.subfields.some(subfield => {
      return subfield.code === expectedSubfieldCodeStr && subfield.value === expectedValue;
    });
  };
}

function checkForWarnings(originalRecord, transformedRecord) {

  // check for mixed alphabets
  const mixedAlphabetsWarnings = transformedRecord.fields.reduce((acc, field) => {
    if (field.subfields) {
      const warnings = field.subfields
        .filter(subfield => isMixedAlphabet(subfield.value))
        .map(subfield => {
          const link = getLink(field).join('-');
          return `Kentässä ${field.tag}${subfield.code} (${link}) on sekä kyrillisiä että latinalaisia merkkejä.`;
        });
      return _.concat(acc, warnings);

    } else {

      if (isMixedAlphabet(field.value)) {
        const link = getLink(field).join('-');
        const warning = `Kentässä ${field.tag} ${link} on sekä kyrillisiä että latinalaisia merkkejä.`;
        return _.concat(acc, warning);
      }
    }
    return acc;
  }, []);

  const brokenLinkWarnings = transformedRecord.fields
    .filter(containsLinkSubfield)
    .filter(field => {
      const linkedField = transformedRecord.fields.find(isLinkedFieldOf(field));
      return linkedField === undefined;
    }).map(field => {
      const link = getLink(field).join('-');
      return `Kenttä ${field.tag} (${link}) linkittää kenttään jota ei ole olemassa.`;
    });

  const subfieldCountMismatchWarnings = _.chain(originalRecord.fields)
    .filter(containsLinkSubfield)
    .filter(field => field.tag !== '880')
    .flatMap(field => {
      const linkedFields = transformedRecord.fields.filter(isLinkedFieldOf(field));
      if (linkedFields === undefined) return [];

      return linkedFields.map(linked => [field, linked]);
    })
    .filter(([field, linkedField]) => {
      return _.difference(_.map(field.subfields, 'code'), _.map(linkedField.subfields, 'code')).length !== 0;
    })
    .map(offendingFieldPairs => {
      const field = offendingFieldPairs[0];
      return `Alkuperäisen tietueen kentässä ${field.tag} ja sen linkittämässä kentässä on eri määrä osakenttiä. Osakenttien sisältö häviää.`;
    })
    .uniq()
    .value();


  const isSFSTransliteratedField = hasSubfieldValue(9, 'SFS4900 <TRANS>');
  const failedSFS4900TransliterationWarnings = transformedRecord.fields
    .filter(field => isSFSTransliteratedField(field) && fieldContainsCyrillicCharacters(field))
    .map(failedField => {
      const originalTag = _.head(getLink(failedField));
      return `Alkuperäisen tietueen kentässä ${originalTag} on merkkejä, joita ei ole määritelty SFS4900-venäjä translitteroinnissa. SFS4900 kenttää ei luotu.`;
    });

  return _.concat(mixedAlphabetsWarnings, brokenLinkWarnings, subfieldCountMismatchWarnings, failedSFS4900TransliterationWarnings);
}

function containsLinkSubfield(field) {
  return (field.subfields && field.subfields.some(sub => sub.code === '6'));
}
function isLinkedFieldOf(queryField) {
  const [queryTag, queryLinkNumber] = getLink(queryField);

  return function(field) {

    const linkInLinkedField = getLink(field);
    const [linkTag, linkNumber] = linkInLinkedField;

    const fieldMatchesQueryLinkTag = field.tag === queryTag;
    const linkNumberMatchesQueryLinkNumber = linkNumber === queryLinkNumber;
    const linkTagLinksBackToQueryField = linkTag === queryField.tag;

    return fieldMatchesQueryLinkTag && linkNumberMatchesQueryLinkNumber && linkTagLinksBackToQueryField;
  };
}

function isMixedAlphabet(str) {
  const hasCyrillic = str.split('').filter(isCharacter).some(isCyrillicCharacter);
  const hasOnlyCyrillic = str.split('').filter(isCharacter).every(isCyrillicCharacter);

  return (hasCyrillic && !hasOnlyCyrillic);
}

function isCharacter(char) {
  return XRegExp('[\\p{Cyrillic}|\\w]').test(char) && !/[0-9_]/.test(char);
}

function normalizeField(field) {
  return isDataField(field) ? normalize(field) : field;

  function normalize(field) {
    return _.assign({}, field, {
      subfields: field.subfields.map(normalizeSub_6)
    });
  }

  function normalizeSub_6(subfield) {
    let {code, value} = subfield;
    if (subfield.code === '6') {
      value = _.head(value.split('/'));
    }
    return {code, value};
  }
}

function moveCyrillicFieldsTo880(fieldList) {
  return fieldList.reduce((fields, field) => {

    if (shouldTransliterateField(field)) {

      const tagForLinking = field.tag;
      const linkNumber = getNextAvailableLinkNumber(_.concat(fieldList, fields));

      const movedField = changeFieldTag(field, tagForLinking, linkNumber);

      if (containsField(fieldList, movedField)) {
        fields.push(field);
      } else {
        fields.push(movedField);
      }

    } else {
      fields.push(field);  
    }
    return fields;
  }, []);


  function changeFieldTag(field, tagForLinking, linkNumber) {

    const newField = _.assign({}, field, {
      tag: '880'
    });
    newField.subfields.unshift({code: '6', value: `${tagForLinking}-${linkNumber}`});
    
    return newField;

  }
}

function containsField(fieldList, field) {
  const isEqualField = _.partial(fieldIsLessOrEqual, field);
  return fieldList.some(isEqualField);
}

function shouldTransliterateField(field) {
  return field.tag !== '880' && fieldContainsCyrillicCharacters(field);
}

function fieldContainsCyrillicCharacters(field) {
  return field.subfields && field.subfields.map(sub => sub.value).some(containsCyrillicCharacters);
}

function containsCyrillicCharacters(str) {
  return str.split('').some(isCyrillicCharacter);
}

function isCyrillicCharacter(char) {
  return XRegExp('[\\p{Cyrillic}]').test(char);
}


function createTransliteratedFieldsFrom880(options, fieldList) {
  
  const fieldsForRemoval = [];

  const transliteratedFieldList = fieldList.reduce((fields, field) => {

    if (shouldCreateTransliteratedFields(field)) {
      
      const link = getLinkSubfield(field).value;
      const [linkedTag, linkNumber] = link.split('-');

      if (options.doSFS4900RusTransliteration) {
        const sfs4900Transliterated = createSFS4900TransliteratedField(field, linkedTag, linkNumber);

        if (!containsField(fieldList, sfs4900Transliterated)) {
          fields.push(sfs4900Transliterated);
        }
      }

      const iso9Transliterated = createISO9TransliteratedField(field, linkedTag, linkNumber);

      if (!containsField(fieldList, iso9Transliterated)) {
        fields.push(iso9Transliterated);

        // We added new "main" field (non-880) with iso9 transliteration. We cleanup the corresponding, 
        // already transliterated field (if any), from the record
        const iso9link = getLinkSubfield(iso9Transliterated);

        fieldList
          .filter(field => field.tag === iso9Transliterated.tag)
          .filter(field => field.subfields.some(sub => _.isEqual(sub, iso9link)))
          .forEach(field => {
            iso9Transliterated.uuid = field.uuid;
            fieldsForRemoval.push(field);
          });
          
      }

      // Mark the original field contents as being cyrillic
      const cyrillicNoteSubField = {code: '9', value: 'CYRILLIC <TRANS>'};
      if (!field.subfields.some(sub => _.isEqual(sub, cyrillicNoteSubField))) {
        field.subfields.push(cyrillicNoteSubField);
      }
    }

    fields.push(field);

    return fields;
  }, []);

  return _.difference(transliteratedFieldList, fieldsForRemoval);



  function createSFS4900TransliteratedField(field, linkedTag, linkNumber) {

    const sfs4900Transliterated = _.assign({}, field, {
      tag: '880',
      uuid: uuid.v4(),
      subfields: field.subfields
        .filter(sub => !isTransliterationSubfield(sub))
        .map(transliterateSubfield('sfs4900'))
    });
    sfs4900Transliterated.subfields.unshift({code: '6', value: `${linkedTag}-${linkNumber}`});
    sfs4900Transliterated.subfields.push({code: '9', value: 'SFS4900 <TRANS>'});
    
    return sfs4900Transliterated;
  }

  function createISO9TransliteratedField(field, linkedTag, linkNumber) {

    const iso9Transliterated = {
      tag: linkedTag,
      uuid: uuid.v4(),
      ind1: field.ind1,
      ind2: field.ind2,
      subfields: field.subfields
        .filter(sub => !isTransliterationSubfield(sub))
        .map(transliterateSubfield('iso9'))
    };
    const iso9TransliteratedLinkSubField = {code: '6', value: `880-${linkNumber}`};
    iso9Transliterated.subfields.unshift(iso9TransliteratedLinkSubField);
    iso9Transliterated.subfields.push({code: '9', value: 'ISO9 <TRANS>'});

    return iso9Transliterated;
  }

  function isTransliterationSubfield(subfield) {
    return subfield.code === '6' || (subfield.code === '9' && subfield.value.indexOf('<TRANS>') !== -1);
  }
}

function getLinkSubfield(field) {
  return field.subfields.find(sub => sub.code === '6');
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

  const numericFields = _.difference(fields, nonNumericFields.map(item => item.field));

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

  return _.head(links) || [];
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
    result: iso9.convertToLatin(str)
  }; 
}