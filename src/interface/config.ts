export interface IWaterlineConfig {
  schema: boolean;
  adapter: string;
  version: number;
  identity: string;

}
export interface IConifg extends IWaterlineConfig {
  appId: string;
  appKey: string;
  masterKey: string;
}
