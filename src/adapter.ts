import * as _ from 'lodash';
import { WaterlineCallback } from './interface/waterline-callback';
import { IConfig } from './interface/config';
import { WaterlineModes } from './interface/waterline-models';
import { LeancloudDB } from './connection/leancloud-db';
import { WaterlineQuery } from './interface/waterline-query';
import { Datastores } from './interface/datastores';

export namespace sailsLeancloud {
  //
  let modelDefinitions = {};

  //TODO: 等 waterline test 更新
  export const identity: string          = 'sails-mongo';
  export const adapterApiVersion: number = 1;

  export const defaults = { schema: false };

  export let datastores: Datastores = {};

  /**
   * 注册一个适配器连接
   *
   * waterline 会调用一次，主要让你记录一些配置
   *
   * @param  {Dictionary}   datastoreConfig  数据库配置 (e.g. host, port, etc.)
   * @param  {Dictionary}   models           数据模型.
   * @param  {Function}     cb               Callback.
   */
  export function registerDatastore(datastoreConfig: IConfig, models: WaterlineModes, cb: WaterlineCallback) {

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
      db    : new LeancloudDB(datastoreConfig, models)
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
    datastores[datastoreName].db.create(datastoreName, query, cb);
  }

  /**
   * 插入多条数据
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function createEach(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    datastores[datastoreName].db.createEach(datastoreName, query, cb);
  }

  /**
   * 查询
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function find(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    datastores[datastoreName].db.find(datastoreName, query, cb);
  }

  /**
   * 更新一个或是多个记录
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function update(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    datastores[datastoreName].db.update(datastoreName, query, cb);
  }

  /**
   * 删除一个或是多个记录
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function destroy(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    datastores[datastoreName].db.destroy(datastoreName, query, cb);
  }

  /**
   * 返回数量
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function count(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    datastores[datastoreName].db.count(datastoreName, query, cb);
  }

  /**
   * Find out the average of the query.
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function avg(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    datastores[datastoreName].db.avg(datastoreName, query, cb);
  }

  /**
   * Find out the sum of the query.
   * @param  {String}       datastoreName 表名
   * @param  {Dictionary}   query         The stage-3 query to perform.
   * @param  {Function}     cb            Callback
   */
  export function sum(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    datastores[datastoreName].db.sum(datastoreName, query, cb);
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
