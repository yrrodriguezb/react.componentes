import React from 'react';
import { Clear, Search } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Popper from '@mui/material/Popper';
import Skeleton from '@mui/material/Skeleton';
import Stack  from '@mui/material/Stack';
import TextField, { TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography';
import api from '../../utils/api';
import { useDebounce, useEvent } from '../../hooks';
import { DataSource, ServiceProps } from '../../interfaces/base';
import { defaultFunction, isBoolean, isEmptyObject, isFunction, isNotEmptyObject, normalizeString } from '../../utils/fn';
import { others as keyCodes } from '../../utils/keyboard';
import { range } from '../../utils/array';
import { EMPTY } from '../../utils';
import { convertToDataSource, isDataSource, isSameDatasource } from '../../utils/datasource'


interface stateProps {
  dataSource: DataSource[],
  open: boolean;
}

interface ListBoxItemProps {
  checkeable?: boolean;
  selected?: boolean;
  index: number;
  onChange?: (data: DataSource) => void;
  option: DataSource;
  renderText?: (option: DataSource) => string;
}

export interface MultipleProps {
  addListItemAll?: boolean;
  returnAsString?: Boolean;
  textSelected?: (count: number) => string;
  textItemAll?: string;
}

type OmitTextFieldProps =  'InputProps' | 'type' | 'onChange';

export interface InputTextProps extends Omit<TextFieldProps, OmitTextFieldProps> {}

export interface TextProps {
  clearable?: boolean;
  defaultValue?: string;
  delay?: number;
  hideIcon?: boolean;
  icon?: () => JSX.Element;
  onChange: (value: string) => void;
  onClear?: () => void;
  inputProps?: InputTextProps;
  inputRef?: React.RefObject<HTMLDivElement>;
}

interface InputTextRef {
  clear: () => void;
}

export interface AutocompletarBaseProps {
  assignFirstValue?: boolean;
  clearable?: boolean;
  clearInputOnSelect?: boolean;
  data?: Array<DataSource | any>;
  delay?: number;
  disablePortal?: boolean;
  executeInputClearIfEmpty?: boolean;
  extraData?: Array<DataSource>;
  filter?: (pattern: string, obj: DataSource) => boolean;
  hideIcon?: boolean;
  iconElement?: () => JSX.Element;
  id?: string;
  inputProps?: InputTextProps;
  onChange?: (value: DataSource|null) => void;
  onInputClear?: () => void;
  openOnClear?: boolean;
  onSelected?: (element: any) => void;
  panelWidth?: number | string;
  renderText?: (obj: DataSource | any) => string;
  returnObject?: boolean;
  value?: string;
}

export interface AutocompletarProps extends AutocompletarBaseProps {
  multiple?: boolean | MultipleProps;
  service?: ServiceProps;
}

const renderTextDefault = (obj: DataSource) => obj?.text;

const InputText = React.forwardRef<InputTextRef, TextProps>((inProps, ref) => {
  const {
    clearable = false,
    defaultValue = '',
    delay = 500,
    hideIcon = false,
    icon: MainIcon,
    inputProps = {},
    inputRef = null,
    onChange,
    onClear,
    ...props
  } = inProps;

  const [ value, setValue ] = React.useState(EMPTY);

  React.useImperativeHandle(ref, () => ({
    clear: () => {
      setValue(EMPTY);
    },
  }))

  React.useEffect(() => {
    setValue(defaultValue);
  }, [ defaultValue ]);

  const debounce = useDebounce(onChange, delay);

  const clear = () => {
    setValue(EMPTY);

    if (onClear) {
      onClear();
    }
  }

  const ClearIcon = () => {
    const visible = Boolean(value.trim().length) && clearable;

    return (
      <IconButton
        sx={{ visibility: visible && !inputProps.disabled ? 'visible' : 'hidden' }}
        onMouseDown={ clear }
        component='label'
        size='small'
        tabIndex={ -1 }
        role='clearbutton'
      >
        <Clear color='disabled' fontSize='small'/>
      </IconButton>
    );
  }

  const IconsEndAdornment = () => {
    return (
      <InputAdornment position='end'>
        { <ClearIcon /> }
        { !hideIcon && MainIcon && <MainIcon /> }
      </InputAdornment>
    )
  }

  const handleInputChange = (event: any) => {
    const inputValue = event.target.value;
    setValue(inputValue);
    debounce(inputValue);
  }

  return (
    <TextField
      size="small"
      sx={{ backgroundColor: 'white' }}
      { ...props }
      { ...inputProps }
      autoComplete='off'
      InputProps={{
        endAdornment: <IconsEndAdornment />,
      }}
      onChange={ handleInputChange }
      ref={ inputRef }
      type="text"
      value={ value }
    />
  )
})

InputText.displayName = "AyFAutocompletar_Input"

const ListBoxItem = React.forwardRef<HTMLInputElement, ListBoxItemProps>((inProps, ref) => {
  const {
    checkeable = false,
    selected = false,
    index,
    option,
    onChange,
    renderText,
  } = inProps;

  const attrs = {
    'data-option-index': index
  }

  const defaultSelected = false || selected;
  const [ checked, setChecked ] = React.useState(false);

  React.useEffect(() => {
    setChecked(defaultSelected);
  }, [ defaultSelected ])

  const handleMouseDown = (event: any) => {
    event.preventDefault();

    if (onChange) {
      onChange(option);
    }

    const isCheched = !checked;
    setChecked(isCheched);
  }

  const renderTextOption = (obj: DataSource) => {
    if (renderText && obj.value !== '-1') {
      return renderText(obj);
    }

    // Solo se renderiza el texto de la opcion (Aplica cuando es seleccion multiple para la opcion -1)
    return renderTextDefault(obj);
  }

  return (
    <ListItem
      disablePadding
      dense
      onMouseDown={ handleMouseDown }
      { ...attrs }
    >
      <ListItemButton selected={ checkeable && checked } tabIndex={ 1 } dense>
        { checkeable &&  (
          <ListItemIcon sx={{ minWidth: 'auto' }}>
            <Checkbox
              checked={ checked }
              edge="start"
              disableRipple
              inputRef={ ref }
              tabIndex={ -1 }
              size='small'
            />
          </ListItemIcon>
        )}
        <ListItemText primary={ renderTextOption(option) } />
      </ListItemButton>
    </ListItem>
  )
})

ListBoxItem.displayName = "AyFAutocompletar_ListBoxItem"

export const Autocompletar = (inProps: AutocompletarProps) => {
  const {
    assignFirstValue = false,
    clearable = false,
    clearInputOnSelect = false,
    data = [],
    delay = 500,
    disablePortal = false,
    executeInputClearIfEmpty = false,
    extraData = [],
    filter: filterCustom,
    iconElement:MainIcon = () => <Search color='disabled' fontSize='small' />,
    hideIcon = false,
    id,
    inputProps,
    multiple,
    onChange,
    onInputClear,
    openOnClear = false,
    onSelected = defaultFunction,
    renderText =  renderTextDefault,
    returnObject = false,
    panelWidth,
    service,
    value = '',
    ...props
  } = inProps;

  const {
    url:urlService = '',
    dataId,
    dataText = 'text',
    dataValue = 'value',
    executeOnce = false,
    executeOnFirstFocus = false,
    searchParam = '',
    params,
    toDataSource
  } = (service || {}) as ServiceProps;

  const {
    addListItemAll = false,
    returnAsString = true,
    textItemAll = 'Todos',
    textSelected,
  } = (multiple || {}) as MultipleProps;

  const rootRef = React.useRef<HTMLDivElement>( null );
  const rootInputRef = React.useRef<HTMLDivElement>( null );
  const inputRef = React.useRef<HTMLInputElement>( null );
  const inputTextRef = React.useRef<InputTextRef>( null );
  const listRef = React.useRef<HTMLUListElement>( null );
  const checkboxAllRef = React.useRef<HTMLInputElement>( null );
  const cursorRef = React.useRef<number>(-1);
  const cursorPrevRef = React.useRef<number>(-1);
  const changeSelected = React.useRef<Boolean>(false);
  const values = React.useRef<any[]>([]);
  const firstFocus = React.useRef(true);
  const firstRequestOnFocus = React.useRef(false);
  const lastValueSelected = React.useRef<DataSource>();

  const [ state, setState ] = React.useState<stateProps>({ dataSource: data || [], open: false });
  const [ anchorEl, setAnchorEl ] = React.useState<null | HTMLElement>(null);
  const [ inputValue, setInputValue ] = React.useState<string>(value || EMPTY);
  const [ initialData, setinitialData ] = React.useState<DataSource[]>([]);
  const [ assignFocus, setAssignFocus ] = React.useState(false);
  const [ loading, setLoading ] = React.useState<boolean>(true);
  const isMultiple = isBoolean(multiple) || isNotEmptyObject(multiple);
  const isHandleInitialData = executeOnce || Boolean(data.length);
  const classNamePrefix = 'Mui';
  const openPoper = Boolean(anchorEl);

  React.useEffect(() => {
    setInputValue(value)
  }, [ value ]);

  React.useEffect(() => {
    firstRequestOnFocus.current = false;
    firstFocus.current = true;
  }, [ params ]);

  React.useEffect(() => {
    setTimeout(() => {
      if (inputRef && inputRef.current && assignFocus) {
        inputRef.current.focus();
        setAssignFocus(false);

        if (!openOnClear) {
          setState(s => ({ ...s, open: openOnClear}));
        }
      }
    }, 0);
  }, [ assignFocus, openOnClear ]);

  const generateGetBoundingClientRect = (x:number = 0, y:number = 0) => {
    const attrs = anchorEl?.getBoundingClientRect();
    const inputAttrs = inputRef.current?.getBoundingClientRect();

    return () => ({
      width: attrs?.width || 0,
      height: inputAttrs?.height || 0,
      top:  attrs?.top || y,
      right: attrs?.right || x,
      bottom: attrs?.bottom || y,
      left: attrs?.left || x,
      x: attrs?.x || x,
      y: attrs?.x || y
    } as DOMRect);
  }

  const virtualElement = {
    getBoundingClientRect: generateGetBoundingClientRect(),
  };

  const request = async (url: string, params: object) => {
    return api.get(url, { params });
  };

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

  const validateAndJoinExtraData = (items: DataSource[]) => {
    if (extraData.length && executeOnce){
      const first = [ ...items ];
      const second = [ ...extraData ];

      const intersection = first.filter((f: DataSource) => second.some((s: DataSource) => f.value === s.value ));

      if (intersection.length) {
        console.error("Datos contenidos en el datasource", intersection);
        throw new Error('La propiedad extraData contiene objetos con el mismo value en el datasource obtenido')
      }

      const notUnique = second.filter((ds: DataSource, index: number, arr: DataSource[]) => arr.some((s: DataSource, i: number) => ds.value === s.value && i > index));

      if (notUnique.length) {
        console.error("Datos duplicados según propiedad [value] en la propiedad extraData", notUnique);
        throw new Error('La propiedad value debe ser única en la propiedad extraData')
      }

      items.unshift(...second);
    }
  }

  const onExecuteOnce = useEvent(async () => {
    // Solo se ejecuta una vez el servicio en el primer foco del input
    if (executeOnce && executeOnFirstFocus && !firstRequestOnFocus.current) {
      return;
    }

    const isFirstFocus = executeOnFirstFocus && firstRequestOnFocus.current;

    if (isHandleInitialData || isFirstFocus) {
      let dataSource: DataSource[] = [];

      if (executeOnce || isFirstFocus) {
        const { data:datos } =  await request(urlService, resolveParams(''));
        dataSource = toDataSource ? toDataSource(datos, returnObject) : mapDataSource(datos);
      } else if (data.length) {
        dataSource = convertToDataSource([ ...data ]);
      }

      if (addListItemAll && dataSource.length > 0 && dataSource.findIndex(e => e.value === '-1') === -1) {
        dataSource.unshift({ text: textItemAll, value: '-1' });
      }

      validateAndJoinExtraData(dataSource);
      setState(s => ({ open: isFirstFocus ? Boolean(dataSource.length) : s.open, dataSource }));
      setinitialData(dataSource);
    }
  });

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
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
    data = data || [];

    if (isNotEmptyObject(service)) {
      if (data.length > 0 && isDataSource(data[0]))
        return data;

      return data.map((d: any) => {
        const { [dataText]:text, [dataValue]:value } = d;
        let o: any = { value, text };

        if(dataId && d[dataId]){
          o.id = d[dataId];
        }
        if (returnObject)
          o.original = { ...d };

        return o as DataSource
      });
    } else{
      return convertToDataSource(data);
    }
  }

  const getData = async (pattern: string) => {
    setLoading(true);

    if (pattern.trim().length) {
      if (urlService) {
        const params = resolveParams(pattern);
        const { data:datos } = await request(urlService, params);

        let dataSource: DataSource[] =  toDataSource ? toDataSource(datos, returnObject) : mapDataSource(datos);
        setState({ dataSource, open: Boolean(dataSource.length) });
      }
    }
    else {
      setState({ dataSource: (executeOnFirstFocus ? state.dataSource : []), open: false });
    }
  }

  const resolveData = () => {
    if (executeOnFirstFocus) {
      // Si el input text tiene valor y encontro datos, devuelve los datos de la ultima consulta
      if (inputRef.current?.value && state.dataSource.length > 0)
        return state.dataSource;
      return initialData;
    }
    return isHandleInitialData ? initialData : data;
  }

  const filter = (pattern: string, obj: DataSource) => {
    const _value = normalizeString(obj.value);
    const _text = normalizeString(obj.text);
    const _original = returnObject ? obj.original : {};
    const _fullValue = renderText({ value: _value, text: _text, ..._original });

    return _value.includes(pattern) || _text.includes(pattern) || _fullValue.includes(pattern);
  }

  const callback = (() => {
    if (isEmptyObject(service) || executeOnce) {
      const _dataSource = mapDataSource(resolveData());
      const _filter = filterCustom || filter;

      return (pattern: string) => {
        const _pattern = normalizeString(pattern);
        const found = !pattern.trim();

        const filterData = _dataSource.filter((el: DataSource) => {
          return _filter(_pattern, el) || found;
        });

        setState({ dataSource: filterData, open: Boolean(filterData.length) });
      }
    }

    return getData;
  })

  const handleInputChange = (value: string) => {
    if (!anchorEl) {
      setAnchorEl(rootRef.current);
    }

    cursorRef.current = -1;
    setLoading(true);

    if (value === EMPTY) {
      // Asigna de nuevo el valor para que el input detecte el cambio (error defaultvalue)
      setInputValue(value);

      if (executeInputClearIfEmpty && onInputClear) {
        onInputClear();
      }
    }

    callback()(value)
    if (!value) {
      if (onChange) {
        onChange(null);
      }
    }
  }

  const assignInputValue = (obj: DataSource, ignoreClearInputOnSelect?: boolean) => {
    const inputValue = ignoreClearInputOnSelect ?
      renderText(obj)
      : clearInputOnSelect ? EMPTY : renderText(obj);

    setInputValue(inputValue);
  }

  const handleSelected = (obj: DataSource) => {
    if (obj) {
      if (isMultiple) {
        handleSelectItem(obj.value);
        return;
      }

      if (lastValueSelected.current && isSameDatasource(lastValueSelected.current, obj)) {
        setState(s => ({ ...s, open: false }))
        // Se asigna en vacio, por que no cambia el input cuando el datasource es el mismo y se retrasa el proximo estado
        setInputValue(EMPTY);
        setTimeout(() => assignInputValue(obj), 0);
        return;
      }

      lastValueSelected.current = obj;

      onSelected(obj);
      assignInputValue(obj);

      if (clearInputOnSelect) {
        inputTextRef.current?.clear();
        setState({ dataSource: resolveData(), open: false });
      } else {
        setState({ ...state, open: false });
      }

      if (onChange) {
        onChange(obj);
      }
    }
  }

  const isActiveElementInListbox = (listboxRef: React.RefObject<HTMLUListElement>) => {
    return listboxRef.current !== null && listboxRef.current.parentElement?.contains(document.activeElement);
  }

  const findAndAssignFirstValue = (value: string) => {
    const obj = state.dataSource.find(e => e.value === value);

    if (obj) {
      lastValueSelected.current = obj;
      onSelected(obj);
      assignInputValue(obj);
    }
  }

  const handleInputBlur = (event: any) => {
    cursorRef.current = cursorPrevRef.current = -1;
    if (isActiveElementInListbox(listRef)){
      inputRef.current?.focus();
      return;
    }

    firstFocus.current = true;

    if (isMultiple && changeSelected.current) {
      changeSelected.current = false;
      onSelected(returnAsString ?  values.current.join(',') : values.current);
      setState({ dataSource: resolveData(), open: false });
      return;
    } else if (assignFirstValue && !isNaN(event.target.value)) {
      findAndAssignFirstValue(event.target.value);
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

  const triggerMouseDown = (indexElemnet: number) => {
    const item = listRef.current?.querySelector(`[data-option-index='${indexElemnet}']`)

    if (item) {
      const mouseoverEvent = new Event('mousedown', { bubbles: true });
      item.dispatchEvent(mouseoverEvent);
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
      triggerMouseDown(cursor);
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

  const handleInputClear = () => {
    lastValueSelected.current = undefined;

    if (!assignFocus) {
      setAssignFocus(true);
    }

    setInputValue(EMPTY);

    if (onInputClear) {
      onInputClear();
    }

    if (!executeOnce && !isMultiple) {
      setState({ dataSource: [], open: false })
    } else if (executeOnFirstFocus) {
      setState({ dataSource: initialData, open: Boolean(initialData.length) })
    }
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

  const handleInputFocus = () => {
    if (!anchorEl) {
      setAnchorEl(rootRef.current);
    }

    if (state.open) {
      return;
    }

    setLoading(true);

    if (!firstRequestOnFocus.current && executeOnFirstFocus) {
      firstRequestOnFocus.current = true;
      onExecuteOnce();
    }

    if (isHandleInitialData || (executeOnFirstFocus && firstRequestOnFocus.current)) {
      var dataSource = resolveData();
      setState({ dataSource, open: Boolean(dataSource.length) });
    }
  }

  const renderTextSelected = () => {
    let arr = values.current.filter(e => e !== '-1');
    const countSelected = arr.length;

    if (textSelected)
      return textSelected(countSelected);

    if (countSelected > 0)
      return countSelected > 1 ? `${countSelected} items seleccionados` : `${countSelected} item seleccionado`;

    return '';
  }

  const handleFilterClear = (event: any) => {
    event.preventDefault();

    if(inputRef.current) {
      inputRef.current.value = '';
    }

    if (values.current.length) {
      values.current = [];
      setLoading(true);
      setState({ dataSource: resolveData(), open: true });
      setInputValue('');
    }
    else if (executeOnFirstFocus) {
      setState({ dataSource: initialData, open: true });
      setInputValue('');
    }
  }

  const getSxPropsList = () => {
    return {
      background: '#FFF',
      height: 'auto',
      maxHeight: '25ch',
      overflow: 'auto',
      position: 'relative' as 'relative',
      width: Boolean(panelWidth) ? panelWidth : rootInputRef.current?.offsetWidth
    }
  }

  const getStylesRoot = () => {
    let style: any = {
      //position: 'relative' as 'relative',
      display: inputProps?.fullWidth ? 'block' :  'inline-block'
    }

    if (inputProps?.fullWidth) {
      style.width =  '100%'
    }

    return style;
  }

  const getListProps = () => {
    return {
      dense: true,
      disablePadding: true,
      ref: listRef,
      sx: { ...getSxPropsList() },
      onMouseDown: (event: any) => {
        // previene el evento blur
        event.preventDefault()
      }
    }
  }

  const getListContainerProps = () => {
    const base = { boxShadow: 10, background: '#FFF', zIndex: 'modal' };

    return base;
  }

  const handleClick = (event: any) => {
    // Se agrega inputProps.disabled, ya que cuando se desabilita el control desde el icono de buscar permite abrir el listbox
    if (!event.currentTarget.contains(event.target) || inputProps?.disabled) {
      return;
    }

    const input = inputRef.current;

    if (input) {
      input.focus();
      if (firstFocus.current && (input.selectionEnd! - input.selectionStart!) === 0) {
        input.select();
      }

      firstFocus.current = false;
    }

    if (!state.open && state.dataSource.length > 0) {
      setState({ ...state, open: true })
    }
  }

  const handleMouseDown = (event: any) => {
    setAnchorEl(event.currentTarget);

    if (!event.currentTarget.contains(event.target)) {
      return;
    }
  }

  const handleSelectAll = () => {
    setLoading(true)
    changeSelected.current = true;

    if (checkboxAllRef.current) {
      checkboxAllRef.current.checked = !checkboxAllRef.current.checked;
      if (checkboxAllRef.current.checked) {
        let newSelected = initialData.map((d) => d.value);
        const index = newSelected.indexOf('-1');

        if (index > -1) {
          newSelected.splice(index, 1);
        }

        values.current = newSelected
        return;
      }
    }
    values.current = [];
  };

  const handleSelectItem = (value: any) => {
    if (value === '-1') {
      handleSelectAll();
      return;
    }

    const selected = values.current || [];
    const selectedIndex = selected.indexOf(value);
    let newSelected: any[] = [];

    cursorRef.current = selectedIndex;

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
    values.current = newSelected;
  }

  const isSelected = (obj: DataSource) => {
    if (obj.value === '-1') {
        return values.current.length === state.dataSource.length - 1;
    }

    return values.current.indexOf(obj.value) > -1;
  };

  const ListBoxActions = () => {
    return (
      <Stack direction='row' justifyContent='end' bgcolor='#F1F0EE' gap={ 1 } padding={ 1 }>
        <Button size='small' color='primary' onMouseDown={ handleFilterClear } tabIndex={ -1 }>
          <Typography gap={ 1.5 }>Limpiar filtros</Typography>
        </Button>
      </Stack>
    )
  }

  const AutocompletarSkeleton = () => {
    const iterations = state.dataSource.length < 10 ? state.dataSource.length : 10;
    const mtb = isMultiple ? 2 : 1;
    const height = 14;
    const width = 17;

    return (
      <>
        <Box sx={{ ...getSxPropsList() }} role="container" >
          {
            range(iterations).map((number: number) => (
              <Stack key={ number } direction="row">
                { isMultiple && <Skeleton animation="wave" variant="rectangular" width={ width } height={ height } sx={{ mt: 2, ml: 2, mb: 2 }}/> }
                <Skeleton animation="wave" variant="rectangular" height={ height } width="100%" sx={ { mt: mtb, ml: 2, mb: mtb, mr: 2 } }/>
              </Stack>
            ))
          }
        </Box>
        { isMultiple && (
          <Stack direction="row" justifyContent="flex-end">
            <Skeleton animation="wave" variant="rectangular" height={ height } width="100px" sx={ { mt: mtb, ml: 2, mb: mtb, mr: 2 } }/>
          </Stack>
        ) }
      </>
    )
  }

  const findValue = (str: string) => {
    if ((+str) && (executeOnce || data.length)) {
      const option = state.dataSource.find(o => normalizeString(str) === normalizeString(o.value));

      if (option) {
        return renderText(option);
      }
    }
    return str;
  }

  const resolveInputValue = () => {
    return findValue(inputValue);
  }

  const resolvePlaceHolder = () => {
    const placeholder = inputProps?.placeholder || '';
    if (isMultiple) {
      if (values.current.length === 0){
        return placeholder;
      }
      return inputValue || renderTextSelected();
    }
    return placeholder;
  }

  return (
    <React.Fragment>
      <div
        id={ id }
        style={ getStylesRoot() }
        onClick={ handleClick }
        onMouseDown={ handleMouseDown }
        ref={ rootRef }
      >
        <InputText
          { ...props }
          inputProps={{
            ...inputProps,
            inputRef: inputRef,
            placeholder: resolvePlaceHolder(),
            onFocus: handleInputFocus,
            onKeyDown: handleInputKeyDown,
            onBlur: handleInputBlur
          }}
          clearable={ clearable }
          delay={ delay }
          hideIcon={ hideIcon }
          icon={ MainIcon }
          onChange={ handleInputChange }
          onClear={ handleInputClear }
          inputRef={ rootInputRef }
          defaultValue={ resolveInputValue() }
          ref={ inputTextRef }
        />
      </div>

      {
        state.open && (
          <Popper open={ openPoper } anchorEl={ virtualElement } role='presentation' disablePortal={ disablePortal } sx={{ zIndex: 'modal' }}>
            <Fade in unmountOnExit style={{ zIndex: 'modal' }}>
              <Stack sx={{ ...getListContainerProps() }}>
                { loading ?
                  <AutocompletarSkeleton /> :
                  <>
                    <List { ...getListProps() }>
                    {
                      state.dataSource.map((option, index) => (
                        <ListBoxItem
                          key={ option.id || option.value }
                          index={ index }
                          option={ option }
                          checkeable={ isMultiple }
                          onChange={ handleSelected }
                          selected={ isSelected(option) }
                          ref={ option.value === '-1' ? checkboxAllRef : null }
                          renderText={ renderText }
                        />
                      ))
                    }
                    </List>
                    { isMultiple && <ListBoxActions /> }
                  </>
              }
              </Stack>
            </Fade>
          </Popper>
        )
      }
    </React.Fragment>
  )
}

Autocompletar.displayName = 'AyFAutocompletar'

export default Autocompletar;
