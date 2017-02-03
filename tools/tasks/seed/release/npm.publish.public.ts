import { exec } from 'child_process';

export = (done: any) => {

  let command = 'npm publish --access=public --registry=https://registry.npmjs.org';

  // Only deletes tags locally, not remote
  exec(command, done);

};
