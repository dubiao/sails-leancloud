import { formatBackData } from './format-data';

export function backData(query, data, scheme, cb) {
  if (query.meta && query.meta.fetch === true) {
    return cb(undefined, formatBackData(data, scheme, query));
  }
  return cb();
}
