import * as _ from 'lodash';

export function skip(query, skip) {
  if (_.isInteger(skip)) {
    query.skip(skip);
  }
  return query;
}
