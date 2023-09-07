import { DataSource } from "../../../interfaces";
import Autocompletar, { InputTextProps, MultipleProps } from "../../Base/Autocompletar";


export interface AutocompletarCentroCostosProps {
  baseURL: string;
  fullWidth?: boolean;
  multiple?: boolean;
  id?: string;
  inputProps?: InputTextProps;
  onSelected: (data: string) => void;
  value?: string;
}

export const AutocompletarCentroCostos = (inProps: AutocompletarCentroCostosProps) => {

  const {
    baseURL,
    fullWidth = false,
    multiple = false,
    id,
    inputProps,
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

  const renderText = (obj: DataSource) => {
    return `${obj.value} - ${obj.text}`;
  }

  return (
    <Autocompletar
      id={ id }
      { ...props }
      clearable={ isClerable() }
      inputProps={{
        placeholder: 'Nombre o código de centro de costos',
        fullWidth,
        ...inputProps
      }}
      multiple={{ ...resolveMultiple() }}
      service={{
        url: `${baseURL}posts/`,
        dataText: 'title',
        dataValue: 'id',
        executeOnFirstFocus: true,
        toDataSource(data) {
            return data.map((e: any) => ({ text: e.title, value: e.id }))
        },
      }}
      onSelected={ onSelected }
      renderText={ renderText }
    />
  )
}

AutocompletarCentroCostos.displayName = "AYFAutocompletarCentroCostos"

export default AutocompletarCentroCostos;
