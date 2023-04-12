import { KeyValuePair } from "../utils";
import { ToDataSource } from "./datasource";

export type Params = KeyValuePair | Function;

export interface Service {
  dataText?: string;
  dataValue?: string;
  params?: Params;
  url: string;
  searchParam?: string;
  executeOnce?: boolean;
};

export interface ServiceProps extends Service, ToDataSource {

};

export default ServiceProps;
