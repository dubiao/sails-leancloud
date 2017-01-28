import * as _ from 'lodash';

function sortBy(query, value, key) {
  if (!key)
    return;

  if (key == 'id' || key == '_id')
    return;

  if (value === 'ASC') {
    console.log(`query.addAscending(${key})`);
    query.addAscending(key);
  } else if (value === 'DESC') {
    console.log(`query.addDescending(${key})`);
    query.addDescending(key);
  }
}

export function sort(query, comparator) {
  console.log('sort:', comparator);
  _.forEach(comparator, value => _.forIn(value, (v, k) => sortBy(query, v, k)));
  return query;
}
