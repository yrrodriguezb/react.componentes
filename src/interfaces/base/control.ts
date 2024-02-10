import DataSource from "./datasource";

export interface ControlProps<T = DataSource | any> {
  id?: string;
  onChange?: (obj: T) => void;
  value?: string;
}

export default ControlProps;
