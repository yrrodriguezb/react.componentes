export interface DataSource {
  id?: number | string;
  value: string,
  text: string
}

export interface ToDataSource {
  toDataSource?: (data: any[], returnObject?: boolean) => DataSource[];
}

export default DataSource;
