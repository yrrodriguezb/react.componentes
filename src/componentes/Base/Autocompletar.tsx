import React from 'react'
import { Clear, Search } from '@mui/icons-material';
import { Fade, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField, { TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography';
import api from '../../utils/api';
import useDebounce from '../../hooks/useDebounce';
import useEvent from '../../hooks/useEvent';
import { DataSource, ServiceProps } from '../../interfaces/base';
import { defaultFunction, isBoolean, isEmptyObject, isFunction, isNotEmptyObject, normalizeString } from '../../utils/fn';
import { others as keyCodes } from '../../utils/keyboard';


interface stateProps {
  dataSource: DataSource[],
  open: boolean;
  value: string;
}

interface ListBoxItemProps {
  index: number;
  option: DataSource;
}

interface MultipleProps {
  addListItemAll?: boolean;
  returnAsString?: Boolean;
  textSelected?: (count: number) => string;
  textItemAll?: string;
}

type OmitTextFieldProps = 'InputProps' | 'onChange' | 'onFocus' | 'onKeyDown' | 'onBlur' | 'type';

interface InputTextProps extends Omit<TextFieldProps, OmitTextFieldProps> { }

export interface AutocompletarProps {
  clearable?: boolean;
  data?: Array<DataSource | any>;
  delay?: number;
  hideIcon?: boolean;
  iconElement?: () => JSX.Element;
  id?: string;
  inputProps?: InputTextProps;
  multiple?: boolean | MultipleProps;
  onSelected?: (element: any) => void;
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
    iconElement:MainIcon = () => <Search color='disabled' />,
    hideIcon = false,
    id,
    inputProps,
    multiple,
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
  } = (service || {}) as ServiceProps;

  const {
    addListItemAll = false,
    returnAsString = true,
    textItemAll = 'Todos',
    textSelected,
  } = (multiple || {}) as MultipleProps;

  const rootInputRef = React.useRef<HTMLDivElement>( null );
  const inputRef = React.useRef<HTMLInputElement>( null );
  const listRef = React.useRef<HTMLUListElement>( null );
  const checkboxAllRef = React.useRef<HTMLInputElement>( null );
  const cursorRef = React.useRef<number>(-1);
  const cursorPrevRef = React.useRef<number>(-1);
  const changeSelected = React.useRef<Boolean>(false);

  const [ state, setState ] = React.useState<stateProps>({
    dataSource: data || [],
    open: false,
    value: ''
  });

  const [ initialData, setinitialData ] = React.useState<DataSource[]>([]);
  const [ selected, setSelected ] = React.useState<readonly any[]>([]);
  const isMultiple = isBoolean(multiple) || isNotEmptyObject(multiple);
  const classNamePrefix = 'Mui';

  const onExecuteOnce = useEvent(async () => {
    if (executeOnce || data.length) {
      let dataSource: DataSource[] = [];

      if (executeOnce) {
        const { data:datos } = await api.get(urlService, { params });
        dataSource = toDataSource ? toDataSource(datos, returnObject) : mapDataSource(datos);
      } else if (data.length) {
        dataSource = toMap([ ...data ]);
      }

      if (addListItemAll && dataSource.length > 0) {
          dataSource.unshift({ text: textItemAll, value: '-1' });
      }

      setState(s => ({ ...s, dataSource }));
      setinitialData(dataSource);
    }
  });

  React.useEffect(() => {
    onExecuteOnce();
  }, [ onExecuteOnce ])

  const setHighlightedIndex = useEvent((index: number) => {
    cursorRef.current = index;

    if (!listRef.current) {
      return;
    }

    const prev = listRef.current.querySelector(`[data-option-index='${cursorPrevRef.current}']`);
    if (prev) {
      prev.classList.remove(`${classNamePrefix}-focused`);
      prev.classList.remove(`${classNamePrefix}-focusVisible`);
    }

    if (index === -1) {
      listRef.current.scrollTop = 0;
      return;
    }

    const option = listRef.current.querySelector(`[data-option-index='${index}']`);
    if (!option) {
      return;
    }

    option.classList.add(`${classNamePrefix}-focusVisible`);
    changeItemActive(index);
  });

  const changeHighlightedIndex = useEvent((cursor: number) => {
      if (!state.open) {
        return;
      }

      setHighlightedIndex(cursor);
    },
  );

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

  const getData = async (pattern: string) => {
    if (pattern.trim().length) {
      if (urlService) {
        const params = resolveParams(pattern);
        const { data:datos } = await api.get(urlService, { params });

        let dataSource: DataSource[] =  toDataSource ? toDataSource(datos, returnObject) : mapDataSource(datos);
        setState({ value: pattern, dataSource, open: Boolean(dataSource.length) });
      }
    }
    else {
      setState({ value: pattern, dataSource: [], open: false });
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
        const dataSource = resolveData();
        const found = !pattern.trim();

        const filterData = mapDataSource(dataSource).filter((el: DataSource) => {
          return filter(pattern, el) || found;
        });

        setState({ value: pattern, dataSource: filterData, open: Boolean(filterData.length) });
      }
    }

    return getData;
  })

  const debounce = useDebounce(callback(), delay);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debounce(event.target.value);
    setState({ ...state, value: event.target.value })
  }

  const handleSelected = (obj: DataSource) => {
    if (obj) {
      if (isMultiple) {
        handleSelectItem(obj.value);
        return;
      }

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

    if (isMultiple && changeSelected.current) {
      changeSelected.current = false;
      onSelected(returnAsString ?  selected.join(',') : selected);
      setState({ ...state, value: renderTextSelected(), dataSource: resolveData(), open: false });
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

  const HandleSelectedAllKeyDown = (cursor: number) => {
    if (addListItemAll && cursor === 0) {
      handleSelectAll();
    }
  }

  const handleInputKeyDown = (e: any) => {
    if (isKeyInvalid(e.keyCode))
      return;

    e.preventDefault();

    let cursor = cursorRef.current;
    cursorPrevRef.current = cursor;

    if (keyCodes.ESC === e.keyCode) {
      setState({ ...state, open: false })
    } else if (e.keyCode === keyCodes.ENTER) {
      const obj = state.dataSource.find((o, i) => i === cursor)  as DataSource;
      HandleSelectedAllKeyDown(cursor);
      if (obj.value !== '-1')
        handleSelected(obj);
    } else if (keyCodes.UP === e.keyCode && cursor > 0) {
      cursor = cursor - 1 ;
    } else if (keyCodes.DOWN === e.keyCode && cursor < (state.dataSource.length - 1)) {
      cursor = cursor + 1;
    } else if (keyCodes.UP === e.keyCode && cursor <= 0) {
      cursor = state.dataSource.length - 1;
    } else  if ((state.dataSource.length - 1) === cursor) {
      cursor = 0;
    }

    changeHighlightedIndex(cursor)
    changeSelectionRange();
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

  const renderTextSelected = () => {
    let arr = selected.filter(e => e !== '-1');
    const countSelected = arr.length;

    if (textSelected)
      return textSelected(countSelected);

    if (countSelected > 0)
      return countSelected > 1 ? `${countSelected} items seleccionados` : `${countSelected} item seleccionado`;

    return '';
  }

  const clear = () => {
    if (isMultiple) {
      if (selected.length) {
        changeSelected.current = true;
        setSelected([]);
      }
    }

    if (state.value || state.open || executeOnce) {
      setState({ value: '', dataSource: resolveData(), open: isMultiple })
    }
  }

  const getSxPropsList = () => {
    return {
      background: '#FFF',
      height: 'auto',
      maxHeight: '25ch',
      overflow: 'auto',
      position: 'relative' as 'relative',
      width: Boolean(panelWidth) ? panelWidth : rootInputRef.current?.offsetWidth,
      zIndex: 'modal',
    }
  }

  const getStylesRoot = () => {
    return {
      display: inputProps?.fullWidth ? 'block' : 'inline-block',
    }
  }

  const ClearIcon = () => {
    const visible = (state.value && clearable) || (clearable && selected.length);

    return (
      <IconButton
        sx={{ visibility: visible ? 'visible' : 'hidden' }}
        onClick={ clear }
        component='label'
        size='small'
        tabIndex={ -1 }
      >
        <Clear color='disabled' />
      </IconButton>
    );
  }

  const IconsEndAdornment = () => {
    return (
      <InputAdornment position='end'>
        { <ClearIcon /> }
        { !hideIcon && <MainIcon /> }
      </InputAdornment>
    )
  }

  const handleMouseDown = (e: any) => {
    e.preventDefault();
  }

  const handleClick = (event: any) => {
    if (!event.currentTarget.contains(event.target)) {
      return;
    }

    const input = inputRef.current;

    if (input) {
      const selection = input.selectionEnd! - input.selectionStart!;
      if (selection === 0) {
        input.select()
        const end = input.value.length;
        input.setSelectionRange(end, end);
      }
    }
  }

  const handleSelectAll = () => {
    changeSelected.current = true;
    if (checkboxAllRef.current) {
      checkboxAllRef.current.checked = !checkboxAllRef.current.checked;
      if (checkboxAllRef.current.checked) {
        const newSelected = initialData.map((d) => d.value);
        setSelected(newSelected);
        return;
      }
    }
    setSelected([]);
  };

  const handleSelectItem = (value: any) => {
    const selectedIndex = selected.indexOf(value);
    let newSelected: any[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, value);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    changeSelected.current = true;
    setSelected(newSelected);
  }

  const isSelected = (obj: DataSource) => {
    return selected.indexOf(obj.value) !== -1;
  };

  const ListBoxCheckbox = (option: DataSource) => {
    const getItemAllProps = () => {
      let CheckboxAllProps = {};

      if (addListItemAll && option.value === '-1') {
        let numSelected = selected.length;
        let rowCount = initialData.length;

        numSelected = selected.indexOf('-1') > -1 ? numSelected - 1 : numSelected;
        rowCount = initialData.findIndex(d => d.value === '-1') > -1 ? rowCount - 1 : rowCount;

        CheckboxAllProps = {
          indeterminate: numSelected > 0 && numSelected < rowCount,
          checked: rowCount > 0 && numSelected === rowCount,
          inputRef: checkboxAllRef,
        }
      }

      return CheckboxAllProps;
    }

    return (
      <ListItemIcon sx={{ minWidth: 'auto' }}>
        <Checkbox
          edge="start"
          checked={ isSelected(option) }
          tabIndex={ -1 }
          disableRipple
          { ...getItemAllProps() }
        />
      </ListItemIcon>
    )
  }

  const ListBoxItem = (inProps: ListBoxItemProps) => {
    const {
      index,
      option
    } = inProps;

    const handleListBoxItemMouseDown = (option: DataSource) => {
      if (addListItemAll && option.value === '-1') {
        handleSelectAll();
        return;
      }

      handleSelected(option);
    }

    const attrs = {
      'data-option-index': index
    }

    return (
      <ListItem
        disablePadding={ isMultiple }
        dense
        onMouseDown={ () => { handleListBoxItemMouseDown(option) } }
        { ...attrs }
      >
        <ListItemButton selected={ isSelected(option) } tabIndex={ 1 } dense>
          { isMultiple && <ListBoxCheckbox { ...option } /> }
          <ListItemText primary={ renderText(option) } />
        </ListItemButton>
      </ListItem>
    )
  }

  const ListBoxActions = () => {
    return (
      <Stack justifyContent='end' direction='row' gap={ 1 } bgcolor='#F1F0EE'>
        <Button size='small' color='primary' onClick={ clear } tabIndex={ -1 }>
          <Typography gap={ 1.5 }>Limpiar filtros</Typography>
        </Button>
      </Stack>
    )
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
        onKeyDown={ handleInputKeyDown }
        onBlur={ handleInputBlur }
        ref={ rootInputRef }
        type="text"
        value={ state.value }
      />
      {
        state.open && (
          <Fade in unmountOnExit>
            <Stack sx={{ boxShadow: 10, background: '#FFF', position: 'absolute' }}>
              <List dense disablePadding ref={ listRef } sx={{ ...getSxPropsList() }}>
                {
                  state.dataSource.map((option, index) => (
                    <ListBoxItem
                      key={ option.value }
                      index={ index }
                      option={ option }
                    />
                  ))
                }
              </List>
              { isMultiple && !clearable && <ListBoxActions /> }
            </Stack>
          </Fade>
        )
      }
    </div>
  )
}

Autocompletar.displayName = 'AyFAutocompletar'

export default Autocompletar;
