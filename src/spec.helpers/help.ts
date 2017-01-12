import * as _ from 'lodash';
import { getFunctionParamNames } from './getFunctionParamNames';

function getSpace(num: number) {
  let str = ' ---';
  while (num--) str += '-';
  return str;
}

export function consoleFunctionArguments(fun: any) {
  let length = 150;
  _.forIn(fun, function (val, key: string) {
    if (_.isFunction(val) && !key.includes('getScheme')) {
      const name = getFunctionParamNames(val);
      fun[key]   = function (_null, query) {
        const param = _.zipObject(name, arguments);
        val.apply(fun, arguments);

        console.log(`[ ${key} ] ${getSpace(length + 20 - key.length)} [ ${new Date().toLocaleString()} ]`);
        let maxLen = 0;
        _.forEachRight(param, (v: any, k: string) => {
          if (k.length > maxLen) {
            maxLen = k.length;
          }
        });

        let len = 1;
        _.forEach(param, (v, k) => {
          if (k !== 'cb') {
            let msg = '';
            try {
              msg = JSON.stringify(v);
            } catch (e) {
              console.log(e);
            }
            let isFirst = true;
            while (msg.length > 0) {
              if (isFirst) {
                console.log(`   ${len++} ${getSpace(maxLen - k.length)} ${k} = ${msg.slice(0, length)}`);
              } else {
                console.log(`   ${len++} ${getSpace(maxLen)}---- ${msg.slice(0, length)}`);
              }
              isFirst = false;
              msg     = msg.slice(length);
            }
          }
        });
        console.log('\n');
      };
    }
  });
}
