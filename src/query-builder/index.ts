import { where } from './_where';
import { limit } from './limit';
import { skip } from './skip';
import { sort } from './sort';
import { select } from './select';
import { joins } from './joins';
import * as AV from 'leanengine';
import { WaterlineQuery } from '../interface/waterline-query';

export function leancloudQuerybuilder(query: WaterlineQuery, scheme: any) {
  let leancloudQuery = new AV.Query(query.using);
  console.log('--------------');
  leancloudQuery = where(leancloudQuery, query.criteria.where, scheme);
  leancloudQuery = select(leancloudQuery, query.criteria.select);
  leancloudQuery = sort(leancloudQuery, query.criteria.sort);
  leancloudQuery = joins(leancloudQuery, query.criteria.joins);
  leancloudQuery = skip(leancloudQuery, query.criteria.skip);
  leancloudQuery = limit(leancloudQuery, query.criteria.limit);

  console.dir({
                where       : leancloudQuery['_where'],
                include     : leancloudQuery['_include'],
                limit       : leancloudQuery['_limit'],
                skip        : leancloudQuery['_skip'],
                extraOptions: leancloudQuery['_extraOptions'],
                order       : leancloudQuery['_order']
              }, { depth: null });
  return leancloudQuery;
}
