import * as _ from 'lodash';
import { inspect } from 'util';
import { consoleFunctionArguments } from './help';
import { sailsLeancloud } from '../adapter';

const TestRunner = require('waterline-adapter-tests');
consoleFunctionArguments(sailsLeancloud);

let _package: any;
let interfaces: any;
let features: any;

// 进程中的 key 方便 ci
const key1 = {
  appId    : process.env.LEANCLOUD_APP_ID,
  appKey   : process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
};

// 本地 key 方便测试
let key2: any;
try {
  key2 = require('./leancloudKey').default;
  console.log('key2', key2);
} catch (e) {
  key2 = {}
}
const config = {};

try {
  _package   = require('../../package.json');
  interfaces = _package.waterlineAdapter.interfaces;
  features   = _package.waterlineAdapter.features;
} catch (e) {
  throw new Error(
    '\n' +
    'Could not read supported interfaces from `waterlineAdapter.interfaces`' + '\n' +
    'in this adapter\'s `package.json` file ::' + '\n' +
    inspect(e)
  );
}

console.log('Testing `' + _package.name + '`, a Sails/Waterline adapter.');
console.log('Running `waterline-adapter-tests` against ' + interfaces.length + ' interfaces...');
console.log('( ' + interfaces.join(', ') + ' )');
console.log('Latest draft of Waterline adapter interface spec:');
console.log('http://links.sailsjs.org/docs/plugins/adapters/interfaces');

new TestRunner({

  // Mocha opts
  mocha: {
    bail    : true,
    reporter: 'spec',
    timeout : process.env.TIMEOUT || 30000
  },

  // Load the adapter module.
  adapter: sailsLeancloud,

  // Default connection config to use.
  config: _.assign(config, key1, key2),

  // The set of adapter interfaces to test against.
  // (grabbed these from this adapter's package.json file above)
  interfaces: interfaces,

  // The set of adapter features to test against.
  // (grabbed these from this adapter's package.json file above)
  features: features,

  mochaChainableMethods: {},

  // Return code != 0 if any test failed
  failOnError: true

  // Most databases implement 'semantic' and 'queryable'.
  //
  // As of Sails/Waterline v0.10, the 'associations' interface
  // is also available.  If you don't implement 'associations',
  // it will be polyfilled for you by Waterline core.  The core
  // implementation will always be used for cross-adapter / cross-connection
  // joins.
  //
  // In future versions of Sails/Waterline, 'queryable' may be also
  // be polyfilled by core.
  //
  // These polyfilled implementations can usually be further optimized at the
  // adapter level, since most databases provide optimizations for internal
  // operations.
  //
  // Full interface reference:
  // https://github.com/balderdashy/sails-docs/blob/master/adapter-specification.md
});
