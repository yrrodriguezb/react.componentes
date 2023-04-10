import { ToDataSource } from "./datasource";

export interface Service {
  dataText?: string;
  dataValue?: string;
  params?: {[key: string]: number | string};
  url: string;
  searchParam?: string;
  executeOnce?: boolean;
};

export interface ServiceProps extends Service, ToDataSource {

};

export default ServiceProps;
