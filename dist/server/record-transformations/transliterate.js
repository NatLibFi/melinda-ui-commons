'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @licstart  The following is the entire license notice for the JavaScript code in this file.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Common modules for Melinda UI applications
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Copyright (C) 2016-2017 University Of Helsinki (The National Library Of Finland)
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


exports.transliterate = transliterate;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _sfs = require('sfs4900');

var sfs4900 = _interopRequireWildcard(_sfs);

var _iso9_ = require('iso9_1995');

var iso9 = _interopRequireWildcard(_iso9_);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _recordUtils = require('../record-utils');

var _marcRecordJs = require('marc-record-js');

var _marcRecordJs2 = _interopRequireDefault(_marcRecordJs);

var _xregexp = require('xregexp');

var _xregexp2 = _interopRequireDefault(_xregexp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = {
  doSFS4900RusTransliteration: true
};

function transliterate(record, options) {

  options = _lodash2.default.assign({}, defaultOptions, options);

  record.fields.forEach(function (field) {
    if (field.uuid === undefined) {
      field.uuid = _nodeUuid2.default.v4();
    }
  });

  return new Promise(function (resolve) {

    var originalRecord = new _marcRecordJs2.default(record);

    var fields = record.fields;

    record.fields = transformFields(options, fields);

    var warnings = checkForWarnings(originalRecord, record);

    record.fields = removeFailedTransliterations(record.fields);

    resolve({ record: record, warnings: warnings });
  });
}

function transformFields(options, fields) {

  var transliterate880Fields = _lodash2.default.partial(createTransliteratedFieldsFrom880, options);

  var transformComposition = _lodash2.default.flow(function (fields) {
    return fields.map(normalizeField);
  }, // normalize link subfields etc.
  moveCyrillicFieldsTo880, // move fields with cyrillic content to 880
  transliterate880Fields, // create transliterated fields for every cyrillic 880
  sortNumericFields // new fields were added, so they need to be sorted
  );

  return transformComposition(fields);
}

function shouldCreateTransliteratedFields(field) {
  return field.tag === '880' && fieldContainsCyrillicCharacters(field);
}

function removeFailedTransliterations(fieldList) {
  var isSFSTransliteratedField = hasSubfieldValue(9, 'SFS4900 <TRANS>');

  return fieldList.filter(function (field) {
    var failedSFS4900Transliteration = isSFSTransliteratedField(field) && fieldContainsCyrillicCharacters(field);
    return !failedSFS4900Transliteration;
  });
}

function hasSubfieldValue(expectedCode, expectedValue) {
  var expectedSubfieldCodeStr = expectedCode.toString();
  return function (field) {
    return field.subfields && field.subfields.some(function (subfield) {
      return subfield.code === expectedSubfieldCodeStr && subfield.value === expectedValue;
    });
  };
}

function checkForWarnings(originalRecord, transformedRecord) {

  // check for mixed alphabets
  var mixedAlphabetsWarnings = transformedRecord.fields.reduce(function (acc, field) {
    if (field.subfields) {
      var warnings = field.subfields.filter(function (subfield) {
        return isMixedAlphabet(subfield.value);
      }).map(function (subfield) {
        var link = getLink(field).join('-');
        return 'Kent\xE4ss\xE4 ' + field.tag + subfield.code + ' (' + link + ') on sek\xE4 kyrillisi\xE4 ett\xE4 latinalaisia merkkej\xE4.';
      });
      return _lodash2.default.concat(acc, warnings);
    } else {

      if (isMixedAlphabet(field.value)) {
        var link = getLink(field).join('-');
        var warning = 'Kent\xE4ss\xE4 ' + field.tag + ' ' + link + ' on sek\xE4 kyrillisi\xE4 ett\xE4 latinalaisia merkkej\xE4.';
        return _lodash2.default.concat(acc, warning);
      }
    }
    return acc;
  }, []);

  var brokenLinkWarnings = transformedRecord.fields.filter(containsLinkSubfield).filter(function (field) {
    var linkedField = transformedRecord.fields.find(isLinkedFieldOf(field));
    return linkedField === undefined;
  }).map(function (field) {
    var link = getLink(field).join('-');
    return 'Kentt\xE4 ' + field.tag + ' (' + link + ') linkitt\xE4\xE4 kentt\xE4\xE4n jota ei ole olemassa.';
  });

  var subfieldCountMismatchWarnings = _lodash2.default.chain(originalRecord.fields).filter(containsLinkSubfield).filter(function (field) {
    return field.tag !== '880';
  }).flatMap(function (field) {
    var linkedFields = transformedRecord.fields.filter(isLinkedFieldOf(field));
    if (linkedFields === undefined) return [];

    return linkedFields.map(function (linked) {
      return [field, linked];
    });
  }).filter(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        field = _ref2[0],
        linkedField = _ref2[1];

    return _lodash2.default.difference(_lodash2.default.map(field.subfields, 'code'), _lodash2.default.map(linkedField.subfields, 'code')).length !== 0;
  }).map(function (offendingFieldPairs) {
    var field = offendingFieldPairs[0];
    return 'Alkuper\xE4isen tietueen kent\xE4ss\xE4 ' + field.tag + ' ja sen linkitt\xE4m\xE4ss\xE4 kent\xE4ss\xE4 on eri m\xE4\xE4r\xE4 osakentti\xE4. Osakenttien sis\xE4lt\xF6 h\xE4vi\xE4\xE4.';
  }).uniq().value();

  var isSFSTransliteratedField = hasSubfieldValue(9, 'SFS4900 <TRANS>');
  var failedSFS4900TransliterationWarnings = transformedRecord.fields.filter(function (field) {
    return isSFSTransliteratedField(field) && fieldContainsCyrillicCharacters(field);
  }).map(function (failedField) {
    var originalTag = _lodash2.default.head(getLink(failedField));
    return 'Alkuper\xE4isen tietueen kent\xE4ss\xE4 ' + originalTag + ' on merkkej\xE4, joita ei ole m\xE4\xE4ritelty SFS4900-ven\xE4j\xE4 translitteroinnissa. SFS4900 kentt\xE4\xE4 ei luotu.';
  });

  return _lodash2.default.concat(mixedAlphabetsWarnings, brokenLinkWarnings, subfieldCountMismatchWarnings, failedSFS4900TransliterationWarnings);
}

function containsLinkSubfield(field) {
  return field.subfields && field.subfields.some(function (sub) {
    return sub.code === '6';
  });
}
function isLinkedFieldOf(queryField) {
  var _getLink = getLink(queryField),
      _getLink2 = _slicedToArray(_getLink, 2),
      queryTag = _getLink2[0],
      queryLinkNumber = _getLink2[1];

  return function (field) {

    var linkInLinkedField = getLink(field);

    var _linkInLinkedField = _slicedToArray(linkInLinkedField, 2),
        linkTag = _linkInLinkedField[0],
        linkNumber = _linkInLinkedField[1];

    var fieldMatchesQueryLinkTag = field.tag === queryTag;
    var linkNumberMatchesQueryLinkNumber = linkNumber === queryLinkNumber;
    var linkTagLinksBackToQueryField = linkTag === queryField.tag;

    return fieldMatchesQueryLinkTag && linkNumberMatchesQueryLinkNumber && linkTagLinksBackToQueryField;
  };
}

function isMixedAlphabet(str) {
  var hasCyrillic = str.split('').filter(isCharacter).some(isCyrillicCharacter);
  var hasOnlyCyrillic = str.split('').filter(isCharacter).every(isCyrillicCharacter);

  return hasCyrillic && !hasOnlyCyrillic;
}

function isCharacter(char) {
  return (0, _xregexp2.default)('[\\p{Cyrillic}|\\w]').test(char) && !/[0-9_]/.test(char);
}

function normalizeField(field) {
  return (0, _recordUtils.isDataField)(field) ? normalize(field) : field;

  function normalize(field) {
    return _lodash2.default.assign({}, field, {
      subfields: field.subfields.map(normalizeSub_6)
    });
  }

  function normalizeSub_6(subfield) {
    var code = subfield.code,
        value = subfield.value;

    if (subfield.code === '6') {
      value = _lodash2.default.head(value.split('/'));
    }
    return { code: code, value: value };
  }
}

function moveCyrillicFieldsTo880(fieldList) {
  return fieldList.reduce(function (fields, field) {

    if (shouldTransliterateField(field)) {

      var tagForLinking = field.tag;
      var linkNumber = getNextAvailableLinkNumber(_lodash2.default.concat(fieldList, fields));

      var movedField = changeFieldTag(field, tagForLinking, linkNumber);

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

    var newField = _lodash2.default.assign({}, field, {
      tag: '880'
    });
    newField.subfields.unshift({ code: '6', value: tagForLinking + '-' + linkNumber });

    return newField;
  }
}

function containsField(fieldList, field) {
  var isEqualField = _lodash2.default.partial(fieldIsLessOrEqual, field);
  return fieldList.some(isEqualField);
}

function shouldTransliterateField(field) {
  return field.tag !== '880' && fieldContainsCyrillicCharacters(field);
}

function fieldContainsCyrillicCharacters(field) {
  return field.subfields && field.subfields.map(function (sub) {
    return sub.value;
  }).some(containsCyrillicCharacters);
}

function containsCyrillicCharacters(str) {
  return str.split('').some(isCyrillicCharacter);
}

function isCyrillicCharacter(char) {
  return (0, _xregexp2.default)('[\\p{Cyrillic}]').test(char);
}

function createTransliteratedFieldsFrom880(options, fieldList) {

  var fieldsForRemoval = [];

  var transliteratedFieldList = fieldList.reduce(function (fields, field) {

    if (shouldCreateTransliteratedFields(field)) {

      var link = getLinkSubfield(field).value;

      var _link$split = link.split('-'),
          _link$split2 = _slicedToArray(_link$split, 2),
          linkedTag = _link$split2[0],
          linkNumber = _link$split2[1];

      if (options.doSFS4900RusTransliteration) {
        var sfs4900Transliterated = createSFS4900TransliteratedField(field, linkedTag, linkNumber);

        if (!containsField(fieldList, sfs4900Transliterated)) {
          fields.push(sfs4900Transliterated);
        }
      }

      var iso9Transliterated = createISO9TransliteratedField(field, linkedTag, linkNumber);

      if (!containsField(fieldList, iso9Transliterated)) {
        fields.push(iso9Transliterated);

        // We added new "main" field (non-880) with iso9 transliteration. We cleanup the corresponding, 
        // already transliterated field (if any), from the record
        var iso9link = getLinkSubfield(iso9Transliterated);

        fieldList.filter(function (field) {
          return field.tag === iso9Transliterated.tag;
        }).filter(function (field) {
          return field.subfields.some(function (sub) {
            return _lodash2.default.isEqual(sub, iso9link);
          });
        }).forEach(function (field) {
          iso9Transliterated.uuid = field.uuid;
          fieldsForRemoval.push(field);
        });
      }

      // Mark the original field contents as being cyrillic
      var cyrillicNoteSubField = { code: '9', value: 'CYRILLIC <TRANS>' };
      if (!field.subfields.some(function (sub) {
        return _lodash2.default.isEqual(sub, cyrillicNoteSubField);
      })) {
        field.subfields.push(cyrillicNoteSubField);
      }
    }

    fields.push(field);

    return fields;
  }, []);

  return _lodash2.default.difference(transliteratedFieldList, fieldsForRemoval);

  function createSFS4900TransliteratedField(field, linkedTag, linkNumber) {

    var sfs4900Transliterated = _lodash2.default.assign({}, field, {
      tag: '880',
      uuid: _nodeUuid2.default.v4(),
      subfields: field.subfields.filter(function (sub) {
        return !isTransliterationSubfield(sub);
      }).map(transliterateSubfield('sfs4900'))
    });
    sfs4900Transliterated.subfields.unshift({ code: '6', value: linkedTag + '-' + linkNumber });
    sfs4900Transliterated.subfields.push({ code: '9', value: 'SFS4900 <TRANS>' });

    return sfs4900Transliterated;
  }

  function createISO9TransliteratedField(field, linkedTag, linkNumber) {

    var iso9Transliterated = {
      tag: linkedTag,
      uuid: _nodeUuid2.default.v4(),
      ind1: field.ind1,
      ind2: field.ind2,
      subfields: field.subfields.filter(function (sub) {
        return !isTransliterationSubfield(sub);
      }).map(transliterateSubfield('iso9'))
    };
    var iso9TransliteratedLinkSubField = { code: '6', value: '880-' + linkNumber };
    iso9Transliterated.subfields.unshift(iso9TransliteratedLinkSubField);
    iso9Transliterated.subfields.push({ code: '9', value: 'ISO9 <TRANS>' });

    return iso9Transliterated;
  }

  function isTransliterationSubfield(subfield) {
    return subfield.code === '6' || subfield.code === '9' && subfield.value.indexOf('<TRANS>') !== -1;
  }
}

function getLinkSubfield(field) {
  return field.subfields.find(function (sub) {
    return sub.code === '6';
  });
}

function fieldIsLessOrEqual(fieldA, fieldB) {
  if (fieldA.tag !== fieldB.tag) return false;
  if (fieldA.ind1 !== fieldB.ind1) return false;
  if (fieldA.ind2 !== fieldB.ind2) return false;
  if (_typeof(fieldA.subfields) !== _typeof(fieldB.subfields)) return false;

  if (fieldA.subfields) {
    if (_lodash2.default.differenceWith(fieldA.subfields, fieldB.subfields, _lodash2.default.isEqual).length !== 0) return false;
  } else {
    if (fieldA.value !== fieldB.value) return false;
  }

  return true;
}

function sortNumericFields(fields) {
  var nonNumericFields = fields.reduce(function (acc, field, i) {
    if (isNaN(field.tag)) {
      acc.push({
        field: field,
        index: i
      });
    }
    return acc;
  }, []);

  var numericFields = _lodash2.default.difference(fields, nonNumericFields.map(function (item) {
    return item.field;
  }));

  numericFields.sort(function (a, b) {
    var byTag = parseInt(a.tag) - parseInt(b.tag);
    if (byTag !== 0) return byTag;

    var _getLink3 = getLink(a),
        _getLink4 = _slicedToArray(_getLink3, 1),
        aLinkedTag = _getLink4[0];

    var _getLink5 = getLink(b),
        _getLink6 = _slicedToArray(_getLink5, 1),
        bLinkedTag = _getLink6[0];

    var byLinkedFieldTag = parseInt(aLinkedTag) - parseInt(bLinkedTag);
    if (byLinkedFieldTag !== 0) return byLinkedFieldTag;

    var cyrillicFirst = fieldContainsCyrillicCharacters(b) ? 1 : -1;
    return cyrillicFirst;
  });

  nonNumericFields.forEach(function (item) {
    numericFields.splice(item.index, 0, item.field);
  });

  return numericFields;
}

function getNextAvailableLinkNumber(fields) {
  var currentLinkNumbers = (0, _lodash2.default)(fields).flatMap(function (field) {
    return field.subfields;
  }).filter(_lodash2.default.isObject).filter(function (sub) {
    return sub.code === '6';
  }).map(function (sub) {
    return sub.value;
  }).map(function (link) {
    return _lodash2.default.last(link.split('-'));
  }).value();

  var isTaken = function isTaken(linkNumberPart) {
    return currentLinkNumbers.some(function (used) {
      return used === linkNumberPart;
    });
  };

  return _lodash2.default.range(1, 100).map(function (num) {
    return _lodash2.default.padStart(num, 2, '0');
  }).find(function (linkNumberPart) {
    return !isTaken(linkNumberPart);
  });
}

function getLink(field) {
  var links = _lodash2.default.get(field, 'subfields', []).filter(function (sub) {
    return sub.code === '6';
  }).map(function (sub) {
    return sub.value;
  }).map(function (link) {
    return link.split('-');
  });

  return _lodash2.default.head(links) || [];
}

function transliterateSubfield(type) {
  return function (subfield) {
    var converted = type === 'sfs4900' ? sfs4900Convert(subfield.value) : iso9Convert(subfield.value);
    return _lodash2.default.assign({}, subfield, { value: converted.result });
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
//# sourceMappingURL=transliterate.js.map