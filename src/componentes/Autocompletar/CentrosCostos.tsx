import { DataSource } from '../../interfaces';
import Autocompletar, { MultipleProps } from '../Base/Autocompletar'

export interface AutocompletarCentroCostosProps {
  baseURL: string;
  multiple?: boolean;
  onSelected: (data: string) => void;
  value?: string;
}

export const AutocompletarCentroCostos = (inProps: AutocompletarCentroCostosProps) => {

  const {
    baseURL,
    multiple = false,
    onSelected,
    ...props
  } = inProps;

  const textSelected = (count: number) => {
    if (count > 1) {
      return `${count} Centros de costos seleccionados`;
    }

    return count === 0 ? '' : `${count} Centro de costos seleccionado`;
  }

  const resolveMultiple = () => {
    return (
      multiple ? {
        addListItemAll: true,
        returnAsString: true,
        textItemAll: "Todos",
        textSelected
      } : {}
    ) as MultipleProps;
  }

  const isClerable = () => {
    return !multiple;
  }

  const isExecuteOnce = () => {
    return multiple;
  }

  const renderText = (obj: DataSource) => {
    return `${obj.value} - ${obj.text}`;
  }

  return (
    <Autocompletar
      { ...props }
      clearable={ isClerable() }
      inputProps={{
        placeholder: 'Nombre o código de centro de costos',
        fullWidth: true
      }}
      multiple={{ ...resolveMultiple() }}
      service={{
        url: `${baseURL}ConsultasGenerales/Consultar_CentrosCostos/`,
        dataText: 'nombre',
        dataValue: 'codigo',
        executeOnce: isExecuteOnce(),
        toDataSource(data: any) {
          return data.datos.map((e: any) => ({ value: e.codigo, text: e.nombre } as DataSource))
        }
      }}
      onSelected={ onSelected }
      renderText={ renderText }
    />
  )
}

AutocompletarCentroCostos.displayName = "AYFAutocompletarCentroCostos"

export default AutocompletarCentroCostos;
