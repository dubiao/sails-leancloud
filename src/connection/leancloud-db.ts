import { IConifg } from '../interface/config';
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
import { formatCreateData } from '../util/format-data';

export class LeancloudDB {
  constructor(private config: IConifg, private models: WaterlineModes) {
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

  getSchema(datastoreName, query) {
    return this.models[query.using];
  }

  create(datastoreName: string, query: WaterlineQuery, cb: WaterlineCallback) {
    const schema = this.getSchema(datastoreName, query);
    const object = new AV.Object(query.using, formatCreateData(query.newRecord, schema));
    object.save().then(data => backData(query, data, schema, cb),
                       error => backError(error, cb));
  }
}
