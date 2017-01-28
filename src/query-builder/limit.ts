import * as _ from 'lodash';

export function limit(query, limit) {
  if (_.isInteger(limit)) {
    if (limit > 1000) {
      limit = 1000;
    }
    query.limit(limit);
  }
  return query;
}
