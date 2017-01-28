export interface IWaterlineModelMeta {
  primaryKey: string;
  definition: any;
  tableName: string;
  identity: string;
}

export type WaterlineModes = { [key: string]: IWaterlineModelMeta }