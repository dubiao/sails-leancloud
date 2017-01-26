import * as _ from 'lodash';
import { getFunctionParamNames } from './getFunctionParamNames';

function getSpace(num: number) {
  let str = ' ---';
  while (num--) str += '-';
  return str;
}

export function consoleFunctionArguments(fun: any) {
  let length = 50;
  _.forIn(fun, function (val, key: string) {
    if (_.isFunction(val)) {
      const name = getFunctionParamNames(val);
      fun[key]   = function (_null, query) {
        const param = _.zipObject(name, arguments);
        val.apply(fun, arguments);
        console.log(`\n\n\n`);
        _.forEach(param, (v, k) => {
          if (k !== 'cb') {
            console.log(`[ ${key} ] ${getSpace(length + 20 - key.length)} [${k}]`);
            console.dir(v, { depth: null });
            console.log('\n');
          }
        });
        console.log('\n\n\n');
      };
    }
  });
}
