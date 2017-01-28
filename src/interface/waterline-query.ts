export interface WaterlineQuery {
  method: string;
  using: string;
  newRecord?: any;
  newRecords?: any[];
  valuesToSet?: any;
  meta?: { fetch: boolean };
  numericAttrName?: string;
  criteria?: {
    where?: any;
    limit?: number;
    skip?: number;
    sort?: any[];
    select?: string[];
    joins?: any[];
  };
}
