import * as _ from 'lodash';

function sortBy(query, value, key) {

  if (!key)
    return query;

  if (key === 'id')
    key = 'createdAt';

  if (value === 1 || value === 'asc' || value === 'ASC') {
    console.log('  ', key, 'asc');
    query.addAscending(key);
  } else if (value === -1 || value === 'desc' || value === 'DESC') {
    console.log('  ', key, 'desc');
    query.addDescending(key);
  }
  return query;
}


function goSort(query, value, key) {
  if (_.isNumber(value)) {
    query = sortBy(query, value, key);
  }
  return query;
}

export function sort(query, comparator) {
  if (!comparator || !query) return query;
  console.log('sort:');
  _.forEach(comparator, function (value, key) {
    query = goSort(query, value, key);
  });
  return query;
};
