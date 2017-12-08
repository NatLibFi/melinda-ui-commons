'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeLocalReference = removeLocalReference;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removeLocalReference(record, opts) {
  var libraryTag = opts.libraryTag,
      expectedLocalId = opts.expectedLocalId,
      skipLocalSidCheck = opts.skipLocalSidCheck,
      bypassSIDdeletion = opts.bypassSIDdeletion;


  if (libraryTag === undefined) {
    throw new Error('Mandatory option missing: libraryTag');
  }

  return new Promise(function (resolve, reject) {
    var report = [];

    if (record.isDeleted()) {
      return reject(new Error('Tietue oli jo poistettu.'));
    }

    if (expectedLocalId && !validateLocalSid(record, libraryTag, expectedLocalId.toString())) {
      return reject(new Error('The record has unexpected SIDc value.'));
    }

    removeSIDFields(record, report, libraryTag, expectedLocalId, skipLocalSidCheck, bypassSIDdeletion);
    removeLOWFields(record, report, libraryTag);

    cleanupRecord(record, report, libraryTag);

    return resolve({ record: record, report: report });
  });
} /**
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


function validateLocalSid(record, libraryTag, expectedLocalId) {
  var lowercaseLibraryTag = libraryTag.toLowerCase();
  return record.getFields('SID', 'b', lowercaseLibraryTag).every(function (field) {
    var subfield_c = field.subfields.filter(function (subfield) {
      return subfield.code === 'c';
    });
    return subfield_c.every(function (subfield) {
      if (subfield.value.startsWith('FCC')) {
        return true;
      }
      return subfield.value == expectedLocalId;
    });
  });
}

function removeSIDFields(record, report, libraryTag, expectedLocalId, skipLocalSidCheck, bypassSIDdeletion) {

  if (bypassSIDdeletion) {
    report.push('Mahdollinen SID säilytetty replikointia varten');
    return;
  }

  if (expectedLocalId === undefined && skipLocalSidCheck !== true) {
    return;
  }

  var fieldsToRemove = getSIDFieldsForRemoval(record, libraryTag, expectedLocalId, skipLocalSidCheck);

  fieldsToRemove.forEach(function (field) {
    var removedLibraryTag = getSubfieldValues(field, 'b').join(',');
    report.push('Poistettu SID: ' + removedLibraryTag);
  });

  record.fields = _lodash2.default.difference(record.fields, fieldsToRemove);
}

function getSIDFieldsForRemoval(record, libraryTag, expectedLocalId, skipLocalSidCheck) {

  var lowercaseLibraryTag = libraryTag.toLowerCase();

  if (skipLocalSidCheck) {
    return record.getFields('SID', 'b', lowercaseLibraryTag);
  } else {
    var normalizedExpectedLocalId = expectedLocalId.toString();
    return record.getFields('SID', 'b', lowercaseLibraryTag, 'c', normalizedExpectedLocalId);
  }
}

function removeLOWFields(record, report, libraryTag) {
  var uppercaseLibraryTag = libraryTag.toUpperCase();
  var fieldsToRemove = record.getFields('LOW', 'a', uppercaseLibraryTag);

  fieldsToRemove.forEach(function (field) {
    var removedLibraryTag = getSubfieldValues(field, 'a').join(',');
    report.push('Poistettu LOW: ' + removedLibraryTag);
  });

  if (fieldsToRemove.length === 0) {
    report.push('Tietueessa ei ollut LOW-kenttää.');
  }

  record.fields = _lodash2.default.difference(record.fields, fieldsToRemove);
}

function cleanupRecord(record, report, libraryTag) {

  record.getDatafields().filter(withSubfield('5')).forEach(function (field) {
    var subfield5List = getSubfields(field, '5');

    if (subfield5List.length === 1) {
      if (subfield5List[0].value === libraryTag.toUpperCase()) {
        removeField(record, field);
        report.push('Poistettu kentt\xE4 ' + field.tag);
      }
    }

    if (subfield5List.length > 1) {
      subfield5List.filter(function (sub) {
        return sub.value === libraryTag.toUpperCase();
      }).forEach(function (subfield) {
        removeSubfield(record, field, subfield);
        report.push('Poistettu osakentt\xE4 $5 (' + subfield.value + ') kent\xE4st\xE4 ' + field.tag);
      });
    }
  });

  record.getDatafields().filter(withSubfield('9')).forEach(function (field) {
    var subfield9List = getSubfields(field, '9');

    subfield9List.filter(replicationCommandMatcher(libraryTag)).forEach(function (subfield) {
      removeSubfield(record, field, subfield);
      report.push('Poistettu osakentt\xE4 $9 (' + subfield.value + ') kent\xE4st\xE4 ' + field.tag);
    });
  });
}

function replicationCommandMatcher(libraryTag) {
  var ucTag = libraryTag.toUpperCase();
  var patterns = [ucTag + ' <KEEP>', ucTag + ' <DROP>'];

  return function (subfield) {
    return patterns.some(function (pattern) {
      return pattern === subfield.value;
    });
  };
}

function removeField(record, field) {
  record.fields = _lodash2.default.without(record.fields, field);
}
function removeSubfield(record, field, subfield) {
  field.subfields = _lodash2.default.without(field.subfields, subfield);
}

function withSubfield(code) {
  return function (field) {
    return field.subfields.some(function (sub) {
      return sub.code === code;
    });
  };
}

function getSubfieldValues(field, code) {
  return getSubfields(field, code).map(function (sub) {
    return sub.value;
  });
}

function getSubfields(field, code) {
  return field.subfields.filter(function (sub) {
    return sub.code === code;
  });
}
//# sourceMappingURL=remove-local-reference.js.map