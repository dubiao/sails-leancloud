import { where } from './where';
import { limit } from './limit';
import { skip } from './skip';
import { sort } from './sort';
import { select } from './select';
import * as AV from 'leanengine';
import { WaterlineQuery } from '../interface/waterline-query';

export function leancloudQuerybuilder(query: WaterlineQuery, scheme: any) {
  let leancloudQuery = new AV.Query(query.using);
  leancloudQuery     = where(leancloudQuery, query.criteria.where, scheme);
  leancloudQuery     = select(leancloudQuery, query.criteria.select);
  leancloudQuery     = sort(leancloudQuery, query.criteria.sort);
  leancloudQuery     = skip(leancloudQuery, query.criteria.skip);
  leancloudQuery     = limit(leancloudQuery, query.criteria.limit);
  return leancloudQuery;
}
