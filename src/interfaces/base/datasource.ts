export interface DataSource<T = any> {
  id?: number | string;
  value: string,
  text: string
  original?: T;
}

export interface ToDataSource {
  toDataSource?: (data: any[], returnObject?: boolean) => DataSource[];
}

export default DataSource;
