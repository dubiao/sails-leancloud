import * as _ from 'lodash';
import { WaterlineCallback } from './interface/waterline-callback';
import { IConifg } from './interface/config';
import { WaterlineModes } from './interface/waterline-models';
import { LeancloudDB } from './connection/leancloud-db';
import { WaterlineQuery } from './interface/waterline-query';
import { formatBackData, formatCreateData } from './util/format-data';
import * as AV from 'leanengine';
import { leancloudQuerybuilder } from './query-builder/index';

function backData(query, data, scheme, cb) {
  if (query.meta && query.meta.fetch === true) {
    return cb(undefined, formatBackData(data, scheme, query));
  }
  return cb();
}
function backError(error, cb) {
  if (error) {
    if (error.code === 101) {
      // leancloud 不能通过代码预先创建表，所以当返回101，当做表是空，当程序写数据的时候会自动创建表
      return cb(undefined, [])
    } else if (error.code === 137) {
      // waterline 需要 code 为 'E_UNIQUE'
      error.code = 'E_UNIQUE';
      return cb(error);
    }
  }
  return cb(error);
}

export namespace sailsLeancloud {
  //
  let modelDefinitions = {};

  //
  export const identity: string          = 'sails-mongo';
  export const adapterApiVersion: number = 1;

  export const defaults = { schema: false };

  export let datastores = {};

  function getSchema(datastoreName, query) {
    try {
      return modelDefinitions[datastoreName][query.using];
    } catch (e) {
      return {};
    }
  }

  /**
   * 注册一个适配器连接
   *
   * waterline 会调用一次，主要让你记录一些配置
   *
   * @param  {Dictionary}   datastoreConfig  数据库配置 (e.g. host, port, etc.)
   * @param  {Dictionary}   models           数据模型.
   * @param  {Function}     cb               Callback.
   */
  export function registerDatastore(datastoreConfig: IConifg, models: WaterlineModes, cb: WaterlineCallback) {

    const identity = datastoreConfig.identity;
    if (!identity) {
      return cb(new Error('Invalid datastore config. A datastore should contain a unique identity property.'));
    }

    // 默认设置
    _.defaults(datastoreConfig, {
      appId    : process.env.LEANCLOUD_APP_ID,
      appKey   : process.env.LEANCLOUD_APP_KEY,
      masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
    });

    datastores[identity] = {
      config: datastoreConfig,
      db    : new LeancloudDB(datastoreConfig)
    };

    modelDefinitions[identity] = models;

    cb();
  }

  /**
   * 插入一条数据
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function create(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme = getSchema(datastoreName, query);
    const object = new AV.Object(query.using, formatCreateData(query.newRecord, scheme));
    object.save().then(data => backData(query, data, scheme, cb),
                       error => backError(error, cb));
  }

  /**
   * 插入多条数据
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function createEach(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme    = getSchema(datastoreName, query);
    const allObject = _.map(query.newRecords, record => new AV.Object(query.using, formatCreateData(record, scheme)));
    AV.Object.saveAll(allObject).then(data => backData(query, data, scheme, cb),
                                      error => backError(error, cb));
  }

  /**
   * 查询
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function find(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme              = getSchema(datastoreName, query);
    const leancloudQuery: any = leancloudQuerybuilder(query, scheme);
    leancloudQuery.find()
                  .then(data => cb(undefined, formatBackData(data, scheme, query)),
                        error => backError(error, cb));
  }

  /**
   * 更新一个或是多个记录
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function update(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme              = getSchema(datastoreName, query);
    const leancloudQuery: any = leancloudQuerybuilder(query, scheme);
    leancloudQuery.find()
                  .then(data => _.map(data, (d: any) => d.set(formatCreateData(query.valuesToSet))))
                  .then(data => AV.Object.saveAll(data))
                  .then(data => backData(query, data, scheme, cb),
                        error => backError(error, cb));
  }

  /**
   * 删除一个或是多个记录
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function destroy(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme              = getSchema(datastoreName, query);
    const leancloudQuery: any = leancloudQuerybuilder(query, scheme);
    leancloudQuery.find()
                  .then(data => data.length > 0 ? AV.Object.destroyAll(data) : [])
                  .then(data => backData(query, data, scheme, cb),
                        error => backError(error, cb));
  }

  /**
   * 返回数量
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function count(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme              = getSchema(datastoreName, query);
    const leancloudQuery: any = leancloudQuerybuilder(query, scheme);
    leancloudQuery.count()
                  .then(data => cb(undefined, data),
                        error => backError(error, cb));
  }

  /**
   * Find out the average of the query.
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function avg(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    this.find(datastoreName, query, (err, records) => {
      if (err) { return cb(err); }
      const sum = _.reduce(records, function (memo, row) { return memo + row[query.numericAttrName]; }, 0);
      const avg = sum / records.length;
      return cb(undefined, avg);
    });
  }

  /**
   * Find out the sum of the query.
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function sum(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    this.find(datastoreName, query, (err, records) => {
      if (err) { return cb(err); }
      const sum = _.reduce(records, function (memo, row) { return memo + row[query.numericAttrName]; }, 0);
      return cb(undefined, sum);
    });
  }

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
  export function define(datastoreName: string, tableName: string, definition: any, cb: WaterlineCallback) {
    return cb();
  }

  /**
   * 删除一个表
   *
   * @param  {String}       datastoreName The name of the datastore containing the table to create.
   * @param  {String}       tableName     The name of the table to create.
   * @param  {undefined}    relations     Currently unused
   * @param  {Function}     cb            Callback
   */
  export function drop(datastoreName: string, tableName: string, relations: any, cb: WaterlineCallback) {
    const destroyAllQuery = {
      method  : 'drop',
      using   : tableName,
      meta    : { fetch: false },
      criteria: {
        where: {},
        limit: Number.MAX_VALUE,
        skip : 0
      }
    };
    destroy(datastoreName, destroyAllQuery, (err, records) => {
      return cb();
    });
  }

  export function teardown(identity: string, cb: WaterlineCallback) {
    const datastore = datastores[identity];
    if (!datastore) {
      return new Error('Invalid data store identity. No data store exist with that identity.');
    }
    delete datastores[identity];
    delete modelDefinitions[identity];
    return cb();
  }
}
