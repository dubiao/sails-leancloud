import * as AV from 'leanengine';

AV.init({
          appId    : 'pdc4XM7Pu96zIoYxmGj0kv9T-gzGzoHsz',
          appKey   : 'Fc4cbf8YI3d6lgrb4Glx53Nz',
          masterKey: 'yc3C8xDW4pkhfXFnNVglaYfG'
        });

const q1 = new AV.Query('userTable2');
q1.greaterThan('fName', '2 greaterThan_strings_user');
const q2 = new AV.Query('userTable2');
q2.equalTo('t', 'greaterThan strings test');
const q = AV.Query.and(q1, q2);
q.addAscending('fName');

console.dir(q, { depth: null });
q.find().then((data: any) => {
  // console.log(data.map(d => d.toJSON()));
}, error => {
  console.log('error', error);
});