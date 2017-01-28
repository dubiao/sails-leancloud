import * as _ from 'lodash';
import * as AV from 'leanengine';

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
    query.equalTo(loneKey || 'objectId', val);
    return query;
  }

  _.forEach(val, (value: any, key: string) => {
    switch (key) {
      case '<':
        query.lessThan(loneKey, value);
        break;
      case '<=':
        query.lessThanOrEqualTo(loneKey, value);
        break;
      case '>':
        query.greaterThan(loneKey, value);
        break;
      case '>=':
        query.greaterThanOrEqualTo(loneKey, value);
        break;
      case '!=':
        query.notEqualTo(loneKey, value);
        break;
      case 'nin':
        query.notContainedIn(loneKey, value);
        break;
      case 'in':
        query.containedIn(loneKey, value);
        break;
      case 'like':
        const reg = new RegExp('^' + _.escapeRegExp(value)
                                      .replace(/^%/, '.*')
                                      .replace(/([^\\])%/g, '$1.*')
                                      .replace(/\\%/g, '%') + '$');
        query.matches(loneKey, reg);
        break;
      default:
        throw new Error('Consistency violation: where-clause modifier `' + key + '` is not valid!');
    }
  });
  return query;
}
