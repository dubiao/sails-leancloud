import * as _ from 'lodash';
const jsesc: any = require('jsesc');

export function jsescAll(value) {
  return jsesc(value, {
    'escapeEverything': true
  });
}
export function format2(value) {
  let arr = value.split('.');
  arr     = _.map(arr, function (v) {
    return jsescAll(v);
  });
  return arr.join('.');
}

export function format1(value) {
  // %=.*
  // *=.*
  // ?=.
  value   = value.replace(/([^\*]*)\*([^\*]*)/g, '$1.*$2');
  value   = value.replace(/([^\%]*)\%([^\%]*)/g, '$1.*$2');
  value   = value.replace(/([^\?]*)\?([^\?]*)/g, '$1.$2');
  value   = value.replace(/(\.\*)+/g, '.*');
  let arr = value.split('.*');
  arr     = _.map(arr, function (v) {
    return format2(v);
  });
  return arr.join('.*');
}

export function getRegExp(matchString, action) {
  action = action || '=';

  if (_.isString(matchString)) {
    matchString = [format1(matchString)];
  } else if (_.isArray(matchString)) {
    matchString = _.map(matchString, function (value) {
                          return '(^' + format1(value) + '$)';
                        }
    );
  }

  if (action === '=') {
    return new RegExp('^' + matchString.join('|') + '$', 'i');
  } else {
    return new RegExp('^((?!(' + matchString.join('|') + ')).)*$', 'i');
  }
}
