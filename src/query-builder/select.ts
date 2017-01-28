import * as AV from 'leanengine';

export function select(query: AV.Query, select: string[]) {
  if (select && select.length > 0)
    query.select(...select);
  return query;
}
