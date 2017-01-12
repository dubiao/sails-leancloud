import { WQuery } from '../adapter';
import { where } from './where';
import { limit } from './limit';
import { skip } from './skip';
import { sort } from './sort';
import { select } from './select';
import { joins } from './joins';
import * as AV from 'leanengine';

export function leancloudQuerybuilder(query: WQuery, scheme: any) {
  let leancloudQuery = new AV.Query(query.using);
  leancloudQuery     = where(leancloudQuery, query.criteria.where, scheme);
  leancloudQuery     = limit(leancloudQuery, query.criteria.limit);
  leancloudQuery     = skip(leancloudQuery, query.criteria.skip);
  leancloudQuery     = sort(leancloudQuery, query.criteria.sort);
  leancloudQuery     = select(leancloudQuery, query.criteria.select);
  leancloudQuery     = joins(leancloudQuery, query.criteria.joins);
  return leancloudQuery;
}
