import * as _ from 'lodash';
import * as AV from 'leanengine';
import { formatCreateData, formatBackData } from './util/formatData';
import { leancloudQuerybuilder } from './query-builder/index';

export interface WQuery {
  method: string;
  using: string;
  newRecord?: any;
  newRecords?: any[];
  valuesToSet?: any;
  meta?: { fetch: boolean };
  numericAttrName?: string;
  criteria?: {
    where?: any;
    limit?: number;
    skip?: number;
    sort?: any[];
    select?: string[];
    joins?: any[];
  };
}
export interface WCallback {
  (error?, data?): void;
}
function backData(query, data, scheme, cb) {
  if (query.meta && query.meta.fetch === true) {
    return cb(undefined, formatBackData(data, scheme));
  }
  return cb();
}
function backError(error, cb) {
  return cb(error);
}

function backFindError(error, cb) {
  if (error) {
    // leancloud 不能通过代码预先创建表，所以当返回101，当做表是空，当程序写数据的时候会自动创建表
    if (error.code === 101) {
      return cb(undefined, [])
    }
  }
  return cb(error);
}

export class WaterlineLeancloud {
  // Sails app 里用的
  public identity: string = 'waterline-leancloud';

  // 适配器版本
  public adapterApiVersion: number = 1;

  // 默认配置
  public defaults = {
    appId    : process.env.LEANCLOUD_APP_ID,
    appKey   : process.env.LEANCLOUD_APP_KEY,
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
  };

  // 记录所有配置
  datastores = { models: [] };

  /**
   * 注册一个适配器连接
   *
   * waterline 会调用一次，主要让你记录一些配置
   *
   * @param  {Dictionary}   datastoreConfig  数据库配置 (e.g. host, port, etc.)
   * @param  {Dictionary}   models           数据模型.
   * @param  {Function}     cb               Callback.
   */
  registerDatastore = (datastoreConfig: any, models: any[], cb: WCallback) => {
    const identity: string = datastoreConfig.identity;
    if (!identity) {
      return cb(new Error('Invalid datastore config. A datastore should contain a unique identity property.'));
    }

    if (this.datastores[identity]) {
      throw new Error('Datastore `' + identity + '` is already registered.');
    }

    AV.init({
              appId    : datastoreConfig.appId,
              appKey   : datastoreConfig.appKey,
              masterKey: datastoreConfig.masterKey
            });
    this.datastores[identity] = {
      config: datastoreConfig,
      models: models
    };
    return cb();
  };

  /**
   * 插入一条数据
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  create = (datastoreName: string, query: WQuery, cb: WCallback) => {
    const scheme = this.getScheme(datastoreName, query);
    const object = new AV.Object(query.using, formatCreateData(query.newRecord, scheme));
    object.save().then(data => backData(query, data, scheme, cb),
                       error => backError(error, cb));
  };

  /**
   * 插入多条数据
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  createEach = (datastoreName: string, query: WQuery, cb: WCallback) => {
    const scheme    = this.getScheme(datastoreName, query);
    const allObject = _.map(query.newRecords, record => new AV.Object(query.using, formatCreateData(record, scheme)));
    AV.Object.saveAll(allObject).then(data => backData(query, data, scheme, cb),
                                      error => backError(error, cb));
  };

  /**
   * 查询
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  find = (datastoreName: string, query: WQuery, cb: WCallback) => {
    const scheme              = this.getScheme(datastoreName, query);
    const leancloudQuery: any = leancloudQuerybuilder(query, scheme);
    leancloudQuery.find()
                  .then(data => cb(undefined, formatBackData(data, scheme)),
                        error => backFindError(error, cb));
  };

  /**
   * 更新一个或是多个记录
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  update = (datastoreName: string, query: WQuery, cb: WCallback) => {
    const scheme              = this.getScheme(datastoreName, query);
    const leancloudQuery: any = leancloudQuerybuilder(query, scheme);
    leancloudQuery.find()
                  .then(data => _.map(data, (d: any) => d.set(query.valuesToSet)))
                  .then(data => AV.Object.saveAll(data))
                  .then(data => backData(query, data, scheme, cb),
                        error => backError(error, cb));
  };

  /**
   * 删除一个或是多个记录
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  destroy = (datastoreName: string, query: WQuery, cb: WCallback) => {
    const scheme              = this.getScheme(datastoreName, query);
    const leancloudQuery: any = leancloudQuerybuilder(query, scheme);
    leancloudQuery.find()
                  .then(data => data.length > 0 ? AV.Object.destroyAll(data) : [])
                  .then(data => backData(query, data, scheme, cb),
                        error => backError(error, cb));
  };

  /**
   * 返回数量
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  count = (datastoreName: string, query: WQuery, cb: WCallback) => {
    const scheme              = this.getScheme(datastoreName, query);
    const leancloudQuery: any = leancloudQuerybuilder(query, scheme);
    leancloudQuery.count()
                  .then(data => cb(undefined, data),
                        error => backError(error, cb));
  };

  /**
   * Find out the average of the query.
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  avg = (datastoreName: string, query: WQuery, cb: WCallback) => {
    this.find(datastoreName, query, (err, records) => {
      if (err) { return cb(err); }
      const sum = _.reduce(records, function (memo, row) { return memo + row[query.numericAttrName]; }, 0);
      const avg = sum / records.length;
      return cb(undefined, avg);
    });
  };

  /**
   * Find out the sum of the query.
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  sum = (datastoreName: string, query: WQuery, cb: WCallback) => {
    this.find(datastoreName, query, (err, records) => {
      if (err) { return cb(err); }
      const sum = _.reduce(records, function (memo, row) { return memo + row[query.numericAttrName]; }, 0);
      return cb(undefined, sum);
    });
  };

  /**
   * 新建一个表
   *
   * (This is used to allow Sails to do auto-migrations)
   *
   * @param  {String}       datastoreName The name of the datastore containing the table to create.
   * @param  {String}       tableName     The name of the table to create.
   * @param  {Dictionary}   definition    The table definition.
   * @param  {Function}     cb            Callback
   */

  define = (datastoreName: string, tableName, definition, cb: WCallback) => {
    console.log(datastoreName, tableName, definition);
    return cb();
  };

  /**
   * 删除一个表
   *
   * @param  {String}       datastoreName The name of the datastore containing the table to create.
   * @param  {String}       tableName     The name of the table to create.
   * @param  {undefined}    relations     Currently unused
   * @param  {Function}     cb            Callback
   */
  drop = (datastoreName: string, tableName, relations, cb: WCallback) => {
    const destroyAllQuery: WQuery = {
      method  : 'drop',
      using   : tableName,
      meta    : { fetch: false },
      criteria: {
        where: {},
        limit: Number.MAX_VALUE,
        skip : 0
      }
    };
    this.destroy(datastoreName, destroyAllQuery, (err, records) => {
      return cb();
    });
  };

  teardow = (identity, cb) => {
    return cb();
  };

  setSequence = (datastoreName, sequenceName, sequenceValue, cb) => {
    const datastore                   = this.datastores[datastoreName];
    datastore.sequences[sequenceName] = sequenceValue;
    return cb();
  };

  private getScheme(datastoreName: string, query: WQuery): any {
    try {
      return this.datastores[datastoreName]['models'][query.using];
    } catch (e) {
      return {};
    }
  }
}
