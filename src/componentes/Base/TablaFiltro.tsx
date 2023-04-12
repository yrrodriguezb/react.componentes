import React from 'react'
import TablaFiltroBase, {
  TablaFiltroBaseProps
} from './TablaFiltroBase';
import DataSource from '../../interfaces/base/datasource';
import api from '../../utils/api';
import { useEvent } from '../../hooks/useEvent';


export interface TablaFiltroProps extends Omit<TablaFiltroBaseProps, "data"> {
  urlService: string,
  dataValue?: string,
  dataText?: string
}

export const TablaFiltro = (inProps: TablaFiltroProps) => {

  const {
    urlService,
    dataText = 'text',
    dataValue = 'value',
    ...props
  } = inProps;

  const [dataSource, setDataSource] = React.useState<DataSource[]>([]);

  const onInit = useEvent(async () => {
    const { data } = await api.get(urlService);

    let _dataSource: DataSource[] = data.map((d: any) => {
      const { [dataText]:text, [dataValue]:value, ...rest } = d;
      return { value, text, ...rest } as DataSource
    });

    setDataSource(_dataSource);
  });

  React.useEffect(() => {
    onInit();
  }, [ onInit ])

  return (
    <TablaFiltroBase
      data={ dataSource }
      { ...props }
    />
  )
}

TablaFiltro.displayName = "AyfTablaFiltro"

export default TablaFiltro;
