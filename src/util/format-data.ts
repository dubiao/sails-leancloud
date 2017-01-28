import * as _ from 'lodash';

function rewriteId(record: any) {
  if (!record.objectId) return;
  record.id  = record.objectId;
  record._id = record.objectId;
  delete record.objectId;
}
function rewriteCreatedAtUpdatedAt(data: any) {
  if (data.createdAt) {
    data.createdAt = new Date(data.createdAt).getTime();
  }
  if (data.updatedAt) {
    data.updatedAt = new Date(data.updatedAt).getTime();
  }
}

function formatInput(data) {
  delete data._id;
  delete data.objectId;
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  return data;
}

function formatOutput(data: any, select, schema, query) {
  rewriteId(data);
  rewriteCreatedAtUpdatedAt(data);
  if (select)
    data = _.pick(data, select);
  return data;
}

function toJSON(data: any) {
  if (data && data.toJSON) {
    return data.toJSON();
  }
  return data;
}

export const formatBackData = (data: any, schema: any = {}, query: any = {}) => {
  const selectKeys: string[] = <any>_.get(query, 'criteria.select');
  const pk: string           = <any>_.get(schema, 'primaryKey');

  let select;
  if (selectKeys) {
    select = _.compact(_.concat(selectKeys, pk));
  }

  if (_.isArray(data)) {
    return _.map(data, d => formatOutput(toJSON(d), select, schema, query));
  } else {
    return formatOutput(toJSON(data), select, schema, query);
  }
};

export const formatCreateData = (data: any, schema: any = {}) => {
  if (_.isArray(data)) {
    return _.map(data, d => formatInput(d));
  } else {
    return formatInput(data);
  }
};
