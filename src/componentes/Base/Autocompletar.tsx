import React from 'react'
import { Clear, Search } from '@mui/icons-material';
import { Fade, IconButton, ListItem } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField, { TextFieldProps } from '@mui/material/TextField'
import api from '../../utils/api';
import useDebounce from '../../hooks/useDebounce';
import useEvent from '../../hooks/useEvent';
import { DataSource, ServiceProps } from '../../interfaces/base';
import { defaultFunction, isEmptyObject, isFunction, isNotEmptyObject, normalizeString } from '../../utils/fn';
import { others as keyCodes } from '../../utils/keyboard';


interface stateProps {
  dataSource: DataSource[],
  open: boolean;
  value: string;
  cursor: number;
}


type OmitTextFieldProps = 'InputProps' | 'onChange' | 'onFocus' | 'onKeyDown' | 'onBlur' | 'type';

interface InputTextProps extends Omit<TextFieldProps, OmitTextFieldProps> { }

export interface AutocompletarProps {
  clearable?: boolean;
  data?: Array<DataSource | any>;
  delay?: number;
  hideIcon?: boolean;
  iconElement?: () => JSX.Element,
  id?: string;
  inputProps?: InputTextProps;
  onSelected?: (element: DataSource) => void;
  panelWidth?: number | string;
  renderText?: (o: DataSource | any) => string;
  returnObject?: boolean;
  service?: ServiceProps;
}

const renderTextDefault = (obj: DataSource) => obj?.text;

const isDataSource = (obj: any) => {
  return (obj.hasOwnProperty('text') && obj.hasOwnProperty('value'))
}

const toMap = (data: any[]) => {
  if (data.length) {
    if (!isDataSource(data[0])) {
      return data.map((element: any) => {
        return { text: element, value: element } as DataSource
      })
    }
  }

  return data || [];
}

export const Autocompletar = (inProps: AutocompletarProps) => {
  const {
    clearable = false,
    data = [],
    delay = 500,
    iconElement:MainIcon = () => <Search />,
    hideIcon = false,
    id,
    inputProps,
    onSelected = defaultFunction,
    renderText =  renderTextDefault,
    returnObject = false,
    panelWidth,
    service,
    ...props
  } = inProps;

  const {
    url:urlService = '',
    dataText = 'text',
    dataValue = 'value',
    executeOnce = false,
    searchParam = '',
    params = {},
    toDataSource
  } = (service || {}) as ServiceProps

  const rootInputRef = React.useRef<HTMLDivElement>( null );
  const inputRef = React.useRef<HTMLInputElement>( null );
  const listRef = React.useRef<HTMLUListElement>( null );

  const [ state, setState ] = React.useState<stateProps>({
    dataSource: data || [],
    open: false,
    value: '',
    cursor: -1
  });

  const [ initialData, setinitialData ] = React.useState<DataSource[]>([]);

  const onExecuteOnce = useEvent(async () => {
    if (executeOnce) {
      const { data:datos } = await api.get(urlService, { params });
      let dataSource: DataSource[] = toDataSource ? toDataSource(datos, returnObject) : mapDataSource(datos);
      setState(s => ({ ...s, dataSource }));
      setinitialData(dataSource);
    } else if (data.length) {
      let dataSource: DataSource[] = toMap(data);
      setState(s => ({ ...s, dataSource }));
      setinitialData(dataSource);
    }
  });

  React.useEffect(() => {
    onExecuteOnce();
  }, [ onExecuteOnce ])

  const mapDataSource = (data: any[]) => {
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
      return toMap(data);
    }
  }

  const resolveParams = (search: string) => {
    if (isFunction(params)){
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

  const getData = async (pattern: string) => {
    if (pattern.trim().length){
      if (urlService) {
        const params = resolveParams(pattern);
        const { data:datos } = await api.get(urlService, { params });

        let dataSource: DataSource[] =  toDataSource ? toDataSource(datos, returnObject) : mapDataSource(datos);
        setState({ value: pattern, dataSource, open: Boolean(dataSource.length), cursor: -1 });
      }
    }
    else {
      setState({ value: pattern, cursor: -1, dataSource: [], open: false });
    }
  }

  const isHandleInitialData = () => {
    return executeOnce || Boolean(data.length);
  }

  const resolveData = () => {
    return isHandleInitialData() ? initialData : data;
  }

  const filter = (pattern: string, obj: DataSource) => {
    const _pattern = normalizeString(pattern)
    const _value = normalizeString(obj.value);
    const _text = normalizeString(obj.text)

    return _value.includes(_pattern) || _text.includes(_pattern);
  }

  const callback = (() => {
    if (isEmptyObject(service) || executeOnce) {
      return (pattern: string) => {
        if (!pattern.trim().length) {
          setState({ ...state, value: pattern, open: false, cursor: -1 });
          return;
        }

        const dataSource = resolveData();
        const found = !pattern.trim();

        const filterData = mapDataSource(dataSource).filter((el: DataSource) => {
          return filter(pattern, el) || found;
        });

        setState({ value: pattern, dataSource: filterData, open: Boolean(filterData.length), cursor: -1 });
      }
    }

    return getData;
  })

  const debounce = useDebounce(callback(), delay);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debounce(event.target.value);
    setState({ ...state, value: event.target.value, cursor: -1 })
  }

  const handleSelected = (obj: DataSource) => {
    if (obj) {
      onSelected(obj);
      setState({ ...state, value: renderText(obj), open: false });
    }
  }

  const isActiveElementInListbox = (listboxRef: React.RefObject<HTMLUListElement>) => {
    return listboxRef.current !== null && listboxRef.current.parentElement?.contains(document.activeElement);
  }

  const handleInputBlur = (e: any) => {
    if (isActiveElementInListbox(listRef)){
      inputRef.current?.focus();
      return;
    }

    if (state.open) {
      setState({ ...state, open: false });
    }
  }

  const isKeyInvalid = (keyCode: number) => {
    const keys = [
      keyCodes.UP,
      keyCodes.DOWN,
      keyCodes.ESC,
      keyCodes.ENTER
    ]

    return !keys.includes(keyCode)
  }

  const handleKeyDown = (e: any) => {
    if (isKeyInvalid(e.keyCode))
      return;

    const { cursor, dataSource } = state;
    let newCursor = cursor;

    if (keyCodes.ESC === e.keyCode) {
      setState({...state, open: false})
    } else if (e.keyCode === keyCodes.ENTER) {
      const obj = dataSource.find((o, i) => i === cursor)  as DataSource;
      handleSelected(obj);
    } else if (keyCodes.UP === e.keyCode && cursor > 0) {
      newCursor = cursor - 1 ;
      setState({ ...state, cursor: newCursor })
    } else if (keyCodes.DOWN === e.keyCode && cursor < (dataSource.length - 1)) {
      newCursor = cursor + 1;
      setState({ ...state, cursor: newCursor })
    } else if (keyCodes.UP === e.keyCode && cursor <= 0) {
      newCursor = dataSource.length - 1;
      setState({ ...state, cursor: newCursor })
    } else  if ((dataSource.length - 1) === cursor) {
      newCursor = 0;
      setState({ ...state, cursor: newCursor })
    }

    changeItemActive(newCursor);
    changeSelectionRange();
    e.preventDefault();
  }

  const changeItemActive = (cursor: number) => {
    const scrollParent = listRef.current;

    if (scrollParent && scrollParent.scrollHeight > scrollParent.clientHeight) {
      const activeElement: any = scrollParent.children[cursor];

      const { offsetHeight, offsetTop } = activeElement;
      const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;

      const isAbove = offsetTop < scrollTop;
      const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight;

      if (isAbove) {
        scrollParent.scrollTo(0, offsetTop);
      } else if (isBelow) {
        scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight);
      }
    }
  }

  const changeSelectionRange = () => {
    const input = inputRef.current;
    if (input) {
      const end = input.value.length;
      input.setSelectionRange(end, end);
    }
  }

  const handleInputFocus = (e: any) => {
    if (isHandleInitialData()) {
      setState({ ...state, open: Boolean(state.dataSource.length) })
    }
  }

  const clear = () => {
    if (state.value || state.open || executeOnce){
      setState({ ...state, value: '', dataSource: resolveData(),  open: false, cursor: -1 })
    }
  }

  const getSxPropsList = () => {
    return {
      height: 'auto',
      maxHeight: '25ch',
      overflow: 'auto',
      boxShadow: 10,
      background: "#FFF",
      position: 'absolute' as 'absolute',
      zIndex: 'modal',
      width: Boolean(panelWidth) ? panelWidth : rootInputRef.current?.offsetWidth
    }
  }

  const getStylesRoot = () => {
    return {
      display: inputProps?.fullWidth ? 'block' : 'inline-block',
      position: 'relative' as 'relative',
    }
  }

  const ClearIcon = () => {
    return (
      <IconButton onClick={ clear } component="label" size='small' tabIndex={ -1 } >
        <Clear  />
      </IconButton>
    );
  }

  const IconsEndAdornment = () => {
    return (
      <InputAdornment position='end'>
        { clearable && <ClearIcon /> }
        { !hideIcon && <MainIcon /> }
      </InputAdornment>
    )
  }

  const handleMouseDown = (e: any) => {
    e.preventDefault();
  }

  const handleClick = (e: any) => {
    const input = inputRef.current;

    if (input) {
      const selection = input.selectionEnd! - input.selectionStart!;
      if (selection === 0) {
        input.select()
        const end = e.target.value.length;
        input.setSelectionRange(end, end);
      }
    }
  }

  return (
    <div
      id={ id }
      style={ getStylesRoot() }
      onMouseDown={ handleMouseDown }
      onClick={ handleClick }
    >
      <TextField
        size="small"
        { ...props }
        { ...inputProps }
        autoComplete='off'
        inputRef={ inputRef }
        InputProps={{
          endAdornment: <IconsEndAdornment />,
        }}
        onChange={ handleInputChange }
        onFocus={ handleInputFocus }
        onKeyDown={ handleKeyDown }
        onBlur={ handleInputBlur }
        ref={ rootInputRef }
        type="text"
        value={ state.value }
      />
      {
        state.open  && (
          <Fade in unmountOnExit  >
            <List disablePadding ref={ listRef } dense sx={{ ...getSxPropsList() }} >
              {
                state.dataSource.map((option, index) => {
                  return (
                    <ListItem
                      dense
                      key={ option.value }
                      onMouseDown={ () => { handleSelected(option) } }
                    >
                      <ListItemButton selected={ state.cursor === index } tabIndex={ 1 }>
                        <ListItemText primary={ renderText(option) } />
                      </ListItemButton>
                    </ListItem>
                  )
                })
              }
            </List>
          </Fade>
        )
      }
    </div>
  )
}

Autocompletar.displayName = "AyFAutocompletar"

export default Autocompletar;
