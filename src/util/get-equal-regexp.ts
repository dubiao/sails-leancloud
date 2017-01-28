import * as _ from 'lodash';

export function getEqualRegExp(...value: string[]) {
  const matchString = _.flatten(value).map(str => _.escapeRegExp(_.escape(str)));
  return new RegExp('^' + matchString.join('|') + '$', 'i');
}
