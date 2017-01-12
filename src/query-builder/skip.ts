import * as _ from 'lodash';

export function skip(query, skip) {
  if (_.isInteger(skip)) {
    console.log('skip:', skip);
    query.skip(skip);
  }
  return query;
}
