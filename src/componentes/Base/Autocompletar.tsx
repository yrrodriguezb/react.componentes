import React from 'react'
import { Clear, Search } from '@mui/icons-material';
import { Fade, IconButton, ListItem } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField'
import api from '../../utils/api';
import useDebounce from '../../hooks/useDebounce';
import useEvent from '../../hooks/useEvent';
import { DataSource, ServiceProps } from '../../interfaces/base';
import { defaultFunction, isEmptyObject, isNotEmptyObject, normalizeString } from '../../utils/fn';
import { others as keyCodes } from '../../utils/keyboard';

interface stateProps {
  dataSource: DataSource[],
  open: boolean;
  value: string;
  cursor: number;
}

interface IconsEndAdornmentProps {
  showSearch: boolean;
  showClear: boolean;
  onClickClear: () => void;
  children?: React.ReactNode;
}

interface InputTextProps {
  fullWidth?: boolean;
  name?: string;
  placeholder?: string;
}

export interface AutocompletarProps {
  clearable?: boolean;
  data?: Array<DataSource | any>;
  delay?: number;
  hideSearch?: boolean;
  id?: string;
  inputProps?: InputTextProps;
  onSelected?: (element: DataSource) => void;
  panelWidth?: number | string;
  renderText?: (o: DataSource | any) => string;
  required?: boolean;
  returnObject?: boolean;
  service?: ServiceProps;
}

const SearchIcon = React.memo(() => {
  return (
    <InputAdornment position="end">
      <Search color='secondary' />
    </InputAdornment>
  );
})

const ClearIcon = React.memo(({ onClick } : { onClick: () => void }) => {
  return (
    <InputAdornment position='end'>
      <IconButton onClick={ onClick } component="label" size='small' tabIndex={ 1 } >
        <Clear  />
      </IconButton>
    </InputAdornment>
  );
});

const IconsEndAdornment = React.memo((props: IconsEndAdornmentProps) => {
  return (
    <React.Fragment>
      { props.showClear && <ClearIcon  onClick={ props.onClickClear } /> }
      { props.showSearch && <SearchIcon /> }
      { props.children }
    </React.Fragment>
  )
})

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

const Autocompletar = (inProps: AutocompletarProps) => {
  const {
    clearable = false,
    data = [],
    delay = 500,
    hideSearch = false,
    id,
    onSelected = defaultFunction,
    renderText =  renderTextDefault,
    required = false,
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
    searchParam = 'q',
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
    return {
      [searchParam]: search,
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
      setState({ ...state, value: pattern, cursor: -1 });
    }
  }

  const resolveData = () => {
    return executeOnce ? initialData : data;
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

  const handleInputBlur = (e: any) => {
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
    if (executeOnce) {
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
      zIndex: 'modal',
      position: 'absolute' as 'absolute',
      width: Boolean(panelWidth) ? panelWidth : rootInputRef.current?.offsetWidth
    }
  }

  const IsInputInValid = () => {
    return required && !Boolean(normalizeString(state.value).length)
  }

  return (
    <div id={ id }>
      <TextField
        { ...props }
        { ...props.inputProps }
        autoComplete='off'
        error={ IsInputInValid() }
        inputRef={ inputRef }
        InputProps={{
          endAdornment: <IconsEndAdornment showClear={ clearable } showSearch={ !hideSearch } onClickClear={ clear } />,
        }}
        onChange={ handleInputChange }
        onFocus={ handleInputFocus }
        onKeyDown={ handleKeyDown }
        onBlur={ handleInputBlur }
        ref={ rootInputRef }
        size="small"
        type="text"
        value={ state.value }
        variant="outlined"
      />
      {
        state.open  && (
          <Fade in unmountOnExit  >
            <List ref={ listRef } dense sx={{ ...getSxPropsList() }} >
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
