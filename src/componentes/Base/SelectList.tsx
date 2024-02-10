import * as React from 'react'
import InputLabel, { InputLabelProps } from '@mui/material/InputLabel';
import FormControl, { FormControlProps } from '@mui/material/FormControl';
import Select, { SelectChangeEvent, SelectProps } from '@mui/material/Select';
import { ControlProps, DataSource, ServiceProps } from '../../interfaces/base';
import { isFunction, isNotEmptyObject, } from '../../utils/fn';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { useEvent } from '../../hooks';
import { EMPTY } from '../../utils';
import { SxProps } from '@mui/material';
import api from '../../utils/api';
import { convertToDataSource, isDataSource } from '../../utils/datasource';


export interface SelectListBaseProps extends ControlProps {
  addItemEmphy?: boolean;
  autoHidden?: boolean;
  data?: Array<DataSource | any>;
  disablePortal?: boolean;
  emitSelectedValue?: boolean;
  error?: boolean;
  errorMessage?: string;
  formControlProps?: FormControlProps;
  inputLabelProps?: InputLabelProps;
  inputLabelText?: string;
  renderItem?: (obj: DataSource | any) => React.ReactNode,
  renderText?: (obj: DataSource | any) => string;
  returnObject?: boolean;
  assignSelectedValue?: (data: Array<DataSource | any>) => DataSource | any;
  selectProps?: SelectProps;
  sx?: SxProps;
  textItemEmphy?: string;
}

export interface SelectListProps extends SelectListBaseProps {
  service?: ServiceProps;
}

const renderTextDefault = (obj: DataSource) => obj?.text;


export const SelectList = (inProps: SelectListProps) => {
  const {
    addItemEmphy = false,
    autoHidden = false,
    data = [],
    disablePortal = false,
    emitSelectedValue = false,
    error = false,
    errorMessage = '',
    formControlProps,
    id,
    inputLabelProps,
    inputLabelText,
    onChange = (_obj: DataSource) => {},
    renderItem,
    renderText =  renderTextDefault,
    returnObject = false,
    assignSelectedValue,
    service,
    value = '',
    selectProps,
    textItemEmphy = "Ninguno",
    ...props
  } = inProps;

  const {
    url:urlService = '',
    dataText = 'text',
    dataValue = 'value',
    searchParam = '',
    params = {},
    toDataSource
  } = (service || {}) as ServiceProps;

  const {
    displayEmpty = false,
    renderValue : renderValueDefault,
    ...selectListProps
  } = (selectProps || {}) as SelectProps;

  const [ dataSource, setDataSource ] = React.useState<DataSource[]>(data || []);
  const [ selectValue, setSelectValue ] = React.useState(value);
  const [ show, setShow ] = React.useState(true);

  const request = async (url: string, params: object) => {
    return api.get(url, { params });
  };

  const mapDataSource = (data: any[]) => {
    data = data || [];

    if (isNotEmptyObject(service)) {
      if (data.length > 0 && isDataSource(data[0]))
        return data;

      return data.map((d: any) => {
        const { [dataText]:text, [dataValue]:value } = d;
        let o: any = { value, text };

        if (returnObject)
          o.original = { ...d };

        return o as DataSource
      });
    } else{
      return convertToDataSource(data);
    }
  }

  const resolveParams = (search: string) => {
    if (isFunction(params)) {
      return (params as CallableFunction)(search);
    }

    let mainParam: any = {};

    if (searchParam) {
      mainParam[searchParam] = search;
    }

    return {
      ...mainParam,
      ...params
    }
  }

  const findSelectedValue = (data: Array<DataSource | any>) => {
    if (assignSelectedValue && !value) {
      const option = assignSelectedValue(data);

      if (option) {
        setSelectValue(option.value);

        if (emitSelectedValue) {
          onChange(option);
        }
      }
    }
  }

  const onLoad = useEvent(async () => {
    let dataSource: DataSource[] = [];

    if (isNotEmptyObject(service)) {
      const { data:datos } = await request(urlService, resolveParams(''));
      dataSource = toDataSource ? toDataSource(datos, returnObject) : mapDataSource(datos);
    } else if (data.length) {
      dataSource = convertToDataSource([ ...data ]);
    }

    if (autoHidden) {
      setShow(Boolean(dataSource.length));
    }

    findSelectedValue(dataSource);
    setDataSource(dataSource);
  });

  React.useEffect(() => {
    onLoad();
  }, [ onLoad ])

  React.useEffect(() => {
    setSelectValue(value);
  }, [ value ])

  const findElement = (value: string | number) => {
    const option = dataSource.find(o => o.value === value);

    if (option) {
      return option;
    }

    return value === EMPTY ? { value: EMPTY, text: textItemEmphy } as DataSource : null;
  }

  const handleOnChange = (event: SelectChangeEvent<unknown>, _child: React.ReactNode) => {
    const value = event.target.value as string | number;
    const obj = findElement(value);

    if (obj) {
      setSelectValue(obj.value);
      onChange(obj)
    }
  }

  const resolveRenderItem = (obj: DataSource) => {
    if (renderItem) {
      return renderItem(obj);
    }

    return <MenuItem key={ obj.value } value={ obj.value }>{ renderText(obj) }</MenuItem>
  }

  const resolveRenderValue =  () => {
    if(displayEmpty) {
      return (value: any) =>  {
        if(value)
        {
          const obj = dataSource.find(data => data.value === value);
          if(obj)
            return renderText(obj)
        }
        return textItemEmphy
      }
    }
    return undefined
  }

  const Component = () => {
    if (show) {
      return (
        <FormControl { ...formControlProps } >
          { inputLabelText ? <InputLabel { ...inputLabelProps } id={ id }>{ inputLabelText }</InputLabel> : null }
          <Select
            { ...props }
            { ...selectListProps }
            id={ id }
            error={ error }
            labelId={ id }
            onChange={ handleOnChange }
            value={ selectValue }
            displayEmpty = { displayEmpty}
            renderValue= {resolveRenderValue()}
            MenuProps={{ disablePortal }}
          >
            { !displayEmpty && addItemEmphy && Boolean(dataSource.length) ? <MenuItem key={ 0 } value={ EMPTY }>{ textItemEmphy }</MenuItem> : null }
            { dataSource.map(d => resolveRenderItem(d)) }
          </Select>
          { error && errorMessage ? <FormHelperText>{ errorMessage }</FormHelperText> : null }
        </FormControl>
      )
    }

    return null;
  }

  return <Component />
}

SelectList.displayName = 'AyFSelectList';

export default SelectList;
