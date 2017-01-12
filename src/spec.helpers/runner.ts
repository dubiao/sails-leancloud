import { inspect } from 'util';
import { WaterlineLeancloud } from '../adapter';
import { consoleFunctionArguments } from './help';
const TestRunner   = require('waterline-adapter-tests');
const Adapter: any = new WaterlineLeancloud();
consoleFunctionArguments(Adapter);

let _package: any;
let interfaces: any;
let features: any;

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
console.log();
console.log('Latest draft of Waterline adapter interface spec:');
console.log('http://sailsjs.com/documentation/concepts/extending-sails/adapters');
console.log();

new TestRunner({

  // Mocha opts
  mocha: {
    bail   : true,
    timeout: process.env.TIMEOUT || 30000
  },

  // Load the adapter module.
  adapter: Adapter,

  // Default connection config to use.
  config: {
    appId    : process.env.LEANCLOUD_APP_ID,
    appKey   : process.env.LEANCLOUD_APP_KEY,
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
  },

  // The set of adapter interfaces to test against.
  // (grabbed these from this adapter's package.json file above)
  interfaces: interfaces,

  // The set of adapter features to test against.
  // (grabbed these from this adapter's package.json file above)
  features: features,

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
