import { IConfig } from '../interface/config';
import { IWaterlineModelMeta, WaterlineModes } from '../interface/waterline-models';
import { WaterlineQuery } from '../interface/waterline-query';
import * as AV from 'leanengine';
import { where } from '../query-builder/where';
import { limit } from '../query-builder/limit';
import { skip } from '../query-builder/skip';
import { sort } from '../query-builder/sort';
import { select } from '../query-builder/select';
import { WaterlineCallback } from '../interface/waterline-callback';
import { backError } from '../util/back-error';
import { backData } from '../util/back-data';
import { formatCreateData, formatBackData } from '../util/format-data';
import * as _ from 'lodash';

export class LeancloudDB {
  constructor(private config: IConfig, private models: WaterlineModes) {
    AV.init({
              appId    : config.appId,
              appKey   : config.appKey,
              masterKey: config.masterKey
            });
  }

  queryBuilder(query: WaterlineQuery, modelMeta: IWaterlineModelMeta): any {
    let leancloudQuery = new AV.Query(query.using);
    leancloudQuery     = where(leancloudQuery, query.criteria.where, modelMeta.definition);
    leancloudQuery     = limit(leancloudQuery, query.criteria.limit);
    leancloudQuery     = skip(leancloudQuery, query.criteria.skip);
    leancloudQuery     = sort(leancloudQuery, query.criteria.sort);
    leancloudQuery     = select(leancloudQuery, query.criteria.select);
    return leancloudQuery;
  }

  getSchema(datastoreName: string, query: WaterlineQuery) {
    return this.models[query.using];
  }

  create(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const schema = this.getSchema(datastoreName, query);
    const object = new AV.Object(query.using, formatCreateData(query.newRecord, schema));
    object.save().then(data => backData(query, data, schema, cb),
                       error => backError(error, cb));
  }

  createEach(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme    = this.getSchema(datastoreName, query);
    const allObject = _.map(query.newRecords, record => new AV.Object(query.using, formatCreateData(record, scheme)));
    AV.Object.saveAll(allObject).then(data => backData(query, data, scheme, cb),
                                      error => backError(error, cb));
  }

  find(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme              = this.getSchema(datastoreName, query);
    const leancloudQuery: any = this.queryBuilder(query, scheme);
    leancloudQuery.find()
                  .then(data => cb(undefined, formatBackData(data, scheme, query)),
                        error => backError(error, cb));
  }

  update(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme              = this.getSchema(datastoreName, query);
    const leancloudQuery: any = this.queryBuilder(query, scheme);
    leancloudQuery.find()
                  .then(data => _.map(data, (d: any) => d.set(formatCreateData(query.valuesToSet))))
                  .then(data => AV.Object.saveAll(data))
                  .then(data => backData(query, data, scheme, cb),
                        error => backError(error, cb));
  }

  destroy(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme              = this.getSchema(datastoreName, query);
    const leancloudQuery: any = this.queryBuilder(query, scheme);
    leancloudQuery.find()
                  .then(data => data.length > 0 ? AV.Object.destroyAll(data) : [])
                  .then(data => backData(query, data, scheme, cb),
                        error => backError(error, cb));
  }

  count(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const scheme              = this.getSchema(datastoreName, query);
    const leancloudQuery: any = this.queryBuilder(query, scheme);
    leancloudQuery.count()
                  .then(data => cb(undefined, data),
                        error => backError(error, cb));
  }

  avg(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    this.find(datastoreName, query, (err, records) => {
      if (err) { return cb(err); }
      const sum = _.reduce(records, function (memo, row) { return memo + row[query.numericAttrName]; }, 0);
      const avg = sum / records.length;
      return cb(undefined, avg);
    });
  }

  sum(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    this.find(datastoreName, query, (err, records) => {
      if (err) { return cb(err); }
      const sum = _.reduce(records, function (memo, row) { return memo + row[query.numericAttrName]; }, 0);
      return cb(undefined, sum);
    });
  }
}
