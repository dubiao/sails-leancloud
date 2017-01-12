import * as _ from 'lodash';

export function limit(query, limit) {
  if (_.isInteger(limit)) {
    if (limit > 1000) {
      limit = 1000;
      console.warn('limit <= 1000');
    }
    console.log('limit:', limit);
    query.limit(limit);
  }
  return query;
}
