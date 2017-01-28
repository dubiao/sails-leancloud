export interface IWaterlineConfig {
  schema: boolean;
  adapter: string;
  version: number;
  identity: string;

}
export interface IConfig extends IWaterlineConfig {
  appId: string;
  appKey: string;
  masterKey: string;
}
