import { KeyValuePair } from "../utils";
import { ToDataSource } from "./datasource";

export type Params = KeyValuePair | Function;

export interface Service {
  dataId?: string | number;
  dataText?: string;
  dataValue?: string;
  params?: Params;
  url: string;
  searchParam?: string;
  executeOnce?: boolean;
  executeOnFirstFocus?: boolean;
};

export interface ServiceProps extends Service, ToDataSource {

};

export default ServiceProps;
