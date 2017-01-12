import { getRegExp } from './util';
import * as _ from 'lodash';
const AV = require('leanengine');

export function where(query: any, where: any, schema: any = {}) {
  return matchSet(query, where, undefined, schema);
}

function matchSet(query, criteria, parentKey, schema) {
  if (!criteria || _.isEqual(criteria, {})) return query;

  _.forEach(criteria, function (criterion, key) {
    query = matchItem(query, key, criterion, parentKey, schema);
  });
  return query;
}

function getQueryArray(query, options, schema) {
  let querys = [];
  let q;
  _.forEach(options, function (criteria) {
    console.log('select:', query.className);
    q = new AV.Query(query.className);
    matchSet(q, criteria, undefined, schema);
    querys.push(q);
  });
  return querys;
}

function matchOr(query, disjuncts, schema) {
  let querys = getQueryArray(query, disjuncts, schema);
  console.log('_orQuery', disjuncts);
  return query._orQuery(querys);
}

function matchAnd(query, conjuncts, schema) {
  let querys = getQueryArray(query, conjuncts, schema);
  return query._andQuery(querys);
}

function matchLike(query, criteria, schema) {
  _.forEach(criteria, function (value, key) {
    checkLike(query, key, value);
  });
}

function matchNot(model, criteria, schema) {
  return matchSet(model, criteria, undefined, schema);
}


function matchItem(model, key, criterion, parentKey, schema) {
  if (parentKey) {
    if (key === 'equals' || key === '=' || key === 'equal') {
      return matchLiteral(model, parentKey, criterion, '=', schema);
    } else if (key === 'not' || key === '!') {
      return matchLiteral(model, parentKey, criterion, '!', schema);
    } else if (key === 'greaterThan' || key === '>') {
      return matchLiteral(model, parentKey, criterion, '>', schema);
    } else if (key === 'greaterThanOrEqual' || key === '>=') {
      return matchLiteral(model, parentKey, criterion, '>=', schema);
    } else if (key === 'lessThan' || key === '<') {
      return matchLiteral(model, parentKey, criterion, '<', schema);
    } else if (key === 'lessThanOrEqual' || key === '<=') {
      return matchLiteral(model, parentKey, criterion, '<=', schema);
    } else if (key === 'startsWith') {
      return matchLiteral(model, parentKey, criterion, key, schema);
    } else if (key === 'endsWith') {
      return matchLiteral(model, parentKey, criterion, key, schema);
    } else if (key === 'contains') {
      return matchLiteral(model, parentKey, criterion, key, schema);
    } else if (key === 'like') {
      return matchLiteral(model, parentKey, criterion, key, schema);
    } else {
      throw new Error('Invalid query syntax!');
    }
  } else if (key.toLowerCase() === 'or') {
    return matchOr(model, criterion, schema);
  } else if (key.toLowerCase() === 'not') {
    return matchNot(model, criterion, schema);
  } else if (key.toLowerCase() === 'and') {
    return matchAnd(model, criterion, schema);
  } else if (key.toLowerCase() === 'like') {
    return matchLike(model, criterion, schema);
  } else if (_.isArray(criterion)) {
    return matchLiteral(model, key, criterion, '=', schema);
  } else if (_.isObject(criterion) && validSubAttrCriteria(criterion)) {
    return matchSet(model, criterion, key, schema);
  } else {
    return matchLiteral(model, key, criterion, '=', schema);
  }
}


function validSubAttrCriteria(c) {
  if (!_.isObject(c)) return false;
  let valid           = false;
  let validAttributes = [
    'equals', 'not', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual',
    '<', '<=', '!', '>', '>=', 'startsWith', 'endsWith', 'contains', 'like'];
  _.find(validAttributes, function (attr) {
    if (_.has(c, attr)) {
      valid = true;
      return true;
    } else {
      return false;
    }
  });
  return valid;
}

function matchLiteral(query, key, criterion, matchAction, schema) {
  //格式化时间
  if (schema && schema[key] && schema[key].type) {
    let schemaType = schema[key].type;
    if (schemaType === 'date' || schemaType === 'datetime') {
      criterion = new Date(criterion);
    }
  }
  switch (matchAction) {
    case '!':
      checkNotEquals(query, key, criterion, schema);
      break;
    case '=':
      checkEquals(query, key, criterion, schema);
      break;
    case '>':
      checkGreaterThan(query, key, criterion);
      break;
    case '>=':
      checkGreaterThanOrEqualTo(query, key, criterion);
      break;
    case '<':
      checkLessThan(query, key, criterion);
      break;
    case '<=':
      checkLessThanOrEqualTo(query, key, criterion);
      break;
    case 'startsWith':
      checkStartsWith(query, key, criterion);
      break;
    case 'contains':
      checkContains(query, key, criterion);
      break;
    case 'endsWith':
      checkEndsWith(query, key, criterion);
      break;
    case 'like':
      checkLike(query, key, criterion);
      break;
  }
  return query;
}


function checkStartsWith(query, key, matchString) {
  sqlLikeMatch(query, key, matchString + '%');
}
function checkEndsWith(query, key, matchString) {
  sqlLikeMatch(query, key, '%' + matchString);
}
function checkContains(query, key, matchString) {
  sqlLikeMatch(query, key, '%' + matchString + '%');
}
function checkLike(query, key, matchString) {
  sqlLikeMatch(query, key, matchString);
}


function checkLessThanOrEqualTo(query, key, criterion) {
  console.log('  ', key, '<=', criterion);
  query.lessThanOrEqualTo(key, criterion);
}
function checkLessThan(query, key, criterion) {
  console.log('  ', key, '<', criterion);
  query.lessThan(key, criterion);
}
function checkGreaterThanOrEqualTo(query, key, criterion) {
  console.log('  ', key, '>=', criterion);
  query.greaterThanOrEqualTo(key, criterion);
}
function checkGreaterThan(query, key, criterion) {
  console.log('  ', key, '>', criterion);
  query.greaterThan(key, criterion);
}
function checkEquals(query, key, criterion, schema) {
  //如何有数据类型
  if (schema && schema[key]) {
    //字符串
    if (schema[key].type === 'string') {
      if (!schema[key].references) {
        sqlLikeMatch(query, key, criterion);
        return;
      }
    }
  }

  //使用 leancloud 默认方式
  if (_.isArray(criterion)) {
    console.log('  ', key, 'in', criterion);
    query.containedIn(key, criterion);
  } else {
    console.log('  ', key, '=', criterion);
    query.equalTo(key, criterion);
  }
}

function checkNotEquals(query, key, criterion, schema) {
  //如何有数据类型
  if (schema && schema[key]) {
    //字符串
    if (schema[key].type === 'string') {
      if (!schema[key].references) {
        sqlLikeNotMatch(query, key, criterion);
        return;
      }
    }
  }

  //使用 leancloud 默认方式
  if (_.isArray(criterion)) {
    console.log('  ', key, 'not in', criterion);
    query.notContainedIn(key, criterion);
  } else {
    console.log('  ', key, '!=', criterion);
    query.notEqualTo(key, criterion);
  }
}

function setRegExp(query, key, matchString, action) {
  let regex = matchString;
  if (!_.isRegExp(matchString)) {
    regex = getRegExp(matchString, action);
  }
  console.log('  ', key, 'match', regex);
  query.matches(key, regex);
}

function sqlLikeMatch(query, key, matchString) {
  setRegExp(query, key, matchString, '=');
}

function sqlLikeNotMatch(query, key, matchString) {
  setRegExp(query, key, matchString, '!');
}
