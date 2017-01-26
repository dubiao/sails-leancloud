import { IConifg } from '../interface/config';
import { IWaterlineModelMeta, WaterlineModes } from '../interface/waterline-models';
import { WaterlineQuery } from '../interface/waterline-query';
import * as AV from 'leanengine';
import { where } from '../query-builder/where';
import { limit } from '../query-builder/limit';
import { skip } from '../query-builder/skip';
import { sort } from '../query-builder/sort';
import { select } from '../query-builder/select';
import { joins } from '../query-builder/joins';
import { formatBackData } from '../util/formatData';

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
    leancloudQuery     = joins(leancloudQuery, query.criteria.joins);
    return leancloudQuery;
  }

  isFetch(query) {
    return query.meta && query.meta.fetch === true;
  }

  getModel(models, query) {
    return models[query.using];
  }

  find(datastore: any, models: WaterlineModes, query: WaterlineQuery) {
    const modelMeta: IWaterlineModelMeta = this.getModel(models, query);
    const leancloudQuery                 = this.queryBuilder(query, modelMeta);
    return leancloudQuery.find().then(
      data => data,
      error => {
        if (error.code == 101) {
          return [];
        } else {
          return Promise.reject(error);
        }
      });
  }

  destroy(datastore: any, models: WaterlineModes, query: WaterlineQuery) {
    const modelMeta: IWaterlineModelMeta = this.getModel(models, query);
    const leancloudQuery                 = this.queryBuilder(query, modelMeta);
    const isFetch                        = this.isFetch(query);
    leancloudQuery.find()
                  .then(data => {
                    console.log('destroy', data);
                    return data.length > 0 ? AV.Object.destroyAll(data) : []
                  })
                  .then(data => {
                    return isFetch ? formatBackData(data) : [];
                  }, error => {
                    console.log('destroy error', error);
                    return error;
                  });
  }
}
