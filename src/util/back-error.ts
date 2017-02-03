export function backError(error, cb) {
  if (error && error.code) {
    if (error.code === 101) {
      // leancloud 不能通过代码预先创建表，所以当返回101，当做表是空，当程序写数据的时候会自动创建表
      return cb(undefined, [])
    } else if (error.code === 137) {
      // leancloud 137  A unique field was given a value that is already taken.
      error.footprint = {
        identity: 'notUnique',
        keys    : []
      };
      return cb(error);
    }
  }
  return cb(error);
}
