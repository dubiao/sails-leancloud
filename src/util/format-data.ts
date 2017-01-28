import * as _ from 'lodash';

function rewriteId(record: any) {
  if (!record.objectId) return;
  record.id = record.objectId;
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

function formatOutput(data: any) {
  rewriteId(data);
  rewriteCreatedAtUpdatedAt(data);
  return data;
}

function toJSON(data: any) {
  if (data && data.toJSON) {
    return data.toJSON();
  }
  return data;
}

export const formatBackData = (data: any, scheme: any = undefined) => {
  if (_.isArray(data)) {
    return _.map(data, d => formatOutput(toJSON(d)));
  } else {
    return formatOutput(toJSON(data));
  }
};

export const formatCreateData = (data: any, scheme: any = undefined) => {
  if (_.isArray(data)) {
    return _.map(data, d => formatInput(d));
  } else {
    return formatInput(data);
  }
};
