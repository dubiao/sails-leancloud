import { IConfig } from './config';
import { LeancloudDB } from '../connection/leancloud-db';

export interface IDatastore {
  config: IConfig;
  db: LeancloudDB;
}

export type Datastores = {
  [x: string]: IDatastore
}
