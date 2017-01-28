import * as _ from 'lodash';
import * as AV from 'leanengine';
import { getEqualRegExp } from '../util/get-equal-regexp';

export function where(query: AV.Query, whereClause: any, schema: any = {}) {
  let loneKey = _.first(_.keys(whereClause));
  const val   = whereClause[loneKey];

  if (loneKey == 'id' || loneKey == '_id')
    loneKey = 'objectId';

  if (loneKey === 'and' || loneKey === 'or') {
    const qArr: any[] = _.map(val, data => where(new AV.Query(query.className), data, schema));
    return AV.Query[loneKey](...qArr);
  }

  if (_.isUndefined(val)) {
    return query;
  }

  if (!_.isObject(val)) {
    console.log('query.equalTo(', loneKey || 'objectId', val, ')');
    query.equalTo(loneKey || 'objectId', val);
    return query;
  }

  _.forEach(val, (value: any, key: string) => {
    switch (key) {
      case '<':
        console.log(`query.lessThan('${loneKey}', ${value});`);
        query.lessThan(loneKey, value);
        break;
      case '<=':
        console.log(`query.lessThanOrEqualTo('${loneKey}', ${value});`);
        query.lessThanOrEqualTo(loneKey, value);
        break;
      case '>':
        console.log(`query.greaterThan('${loneKey}', ${value});`);
        query.greaterThan(loneKey, value);
        break;
      case '>=':
        console.log(`query.greaterThanOrEqualTo('${loneKey}', ${value});`);
        query.greaterThanOrEqualTo(loneKey, value);
        break;
      case '!=':
        console.log(`query.notEqualTo('${loneKey}', ${value});`);
        query.notEqualTo(loneKey, value);
        break;
      case 'nin':
        console.log(`query.notContainedIn('${loneKey}', ${value});`);
        query.notContainedIn(loneKey, value);
        break;
      case 'in':
        console.log(`query.containedIn('${loneKey}', ${value});`);
        query.containedIn(loneKey, value);
        break;
      case 'like':
        const reg = new RegExp('^' + _.escapeRegExp(value)
                                      .replace(/^%/, '.*')
                                      .replace(/([^\\])%/g, '$1.*')
                                      .replace(/\\%/g, '%') + '$');
        console.log(`query.matches('${loneKey}', ${reg});`);
        query.matches(loneKey, reg);
        break;
      default:
        throw new Error('Consistency violation: where-clause modifier `' + key + '` is not valid!');
    }
  });
  return query;
}
