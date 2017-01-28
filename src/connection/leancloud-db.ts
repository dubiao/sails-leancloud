import { IConifg } from '../interface/config';
import { IWaterlineModelMeta } from '../interface/waterline-models';
import { WaterlineQuery } from '../interface/waterline-query';
import * as AV from 'leanengine';
import { where } from '../query-builder/where';
import { limit } from '../query-builder/limit';
import { skip } from '../query-builder/skip';
import { sort } from '../query-builder/sort';
import { select } from '../query-builder/select';

export class LeancloudDB {
  constructor(config: IConifg) {
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

  isFetch(query) {
    return query.meta && query.meta.fetch === true;
  }

  getModel(models, query) {
    return models[query.using];
  }
}
