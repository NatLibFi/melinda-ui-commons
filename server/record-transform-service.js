import MarcRecord from 'marc-record-js';
import { removeLocalReference } from './record-transformations/remove-local-reference';

export function transformRecord(action, recordParam, opts) {

  if (!looksLikeRecord(recordParam)) {
    throw new Error('Invalid record');
  }

  const record = new MarcRecord(recordParam);

  switch(action) {
    case 'REMOVE-LOCAL-REFERENCE': return removeLocalReference(record, opts);
  }

  throw new Error(`Unknown action ${action}`);
}

function looksLikeRecord(maybeRecord) {
  return maybeRecord && maybeRecord.fields && maybeRecord.fields.constructor === Array;
}
