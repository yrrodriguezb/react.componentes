import React from 'react'
import { Clear, Search } from '@mui/icons-material';
import { Fade, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import TextField, { TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography';
import api from '../../utils/api';
import { useDebounce, useEvent } from '../../hooks';
import { DataSource, ServiceProps } from '../../interfaces/base';
import { defaultFunction, isBoolean, isEmptyObject, isFunction, isNotEmptyObject, normalizeString } from '../../utils/fn';
import { others as keyCodes } from '../../utils/keyboard';
import { range } from '../../utils/array';


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

interface InputTextProps extends Omit<TextFieldProps, OmitTextFieldProps> {}

export interface TextProps {
  clearable?: boolean;
  defaultValue?: string;
  delay?: number;
  hideIcon?: boolean;
  icon?: () => JSX.Element;
  onChange: (value: string) => void;
  inputProps?: InputTextProps;
}

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
  renderText?: (obj: DataSource | any) => string;
  returnObject?: boolean;
  service?: ServiceProps;
  value?: string;
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

const InputText = React.forwardRef<HTMLDivElement, TextProps>((inProps, ref) => {
  const {
    clearable = false,
    defaultValue = '',
    delay = 500,
    hideIcon = false,
    icon: MainIcon,
    inputProps = {},
    onChange,
    ...props
  } = inProps;

  const [ value, setValue ] = React.useState('');

  React.useEffect(() => {
    setValue(defaultValue);
  }, [ defaultValue ])

  const debounce = useDebounce(onChange, delay);

  const clear = () => {
    setValue('');
  }

  const ClearIcon = () => {
    const visible = Boolean(value.trim().length) && clearable;

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
      { ...props }
      { ...inputProps }
      autoComplete='off'
      InputProps={{
        endAdornment:   <IconsEndAdornment />,
      }}
      onChange={ handleInputChange }
      ref={ ref }
      type="text"
      value={ value }
    />
  )
})

const ListBoxItem = React.forwardRef<HTMLInputElement, ListBoxItemProps>((inProps, ref) => {
  const {
    checkeable = false,
    selected = false,
    index,
    option,
    onChange,
    renderText = renderTextDefault,
  } = inProps;

  const attrs = {
    'data-option-index': index
  }

  const defaultSelected = false || selected;
  const [ checked, setChecked ] = React.useState(false);

  React.useEffect(() => {
    setChecked(defaultSelected);
  }, [ defaultSelected ])

  const handleMouseDown = () => {
    if (onChange) {
      onChange(option);
    }
    const isCheched = !checked;
    setChecked(isCheched);
  }

  return (
    <ListItem
      disablePadding
      dense
      onMouseDown={() => { handleMouseDown() }}
      { ...attrs }
    >
      <ListItemButton selected={ checkeable && checked } tabIndex={ 1 } dense>
        { checkeable &&  (
          <ListItemIcon sx={{ minWidth: 'auto' }}>
            <Checkbox
              edge="start"
              checked={ checked }
              tabIndex={ -1 }
              disableRipple
              inputRef={ ref }
            />
          </ListItemIcon>
        )}
        <ListItemText primary={ renderText(option) } />
      </ListItemButton>
    </ListItem>
  )
})

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
    value = '',
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
  const values = React.useRef<any[]>([]);

  const [ state, setState ] = React.useState<stateProps>({dataSource: data || [], open: false });
  const [ inputValue, setInputValue ] = React.useState<string>('' || value);
  const [ initialData, setinitialData ] = React.useState<DataSource[]>([]);
  const [ loading, setLoading ] = React.useState<boolean>(true);
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
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
    setLoading(true);

    if (pattern.trim().length) {
      if (urlService) {
        const params = resolveParams(pattern);
        const { data:datos } = await api.get(urlService, { params });

        let dataSource: DataSource[] =  toDataSource ? toDataSource(datos, returnObject) : mapDataSource(datos);
        setState({ dataSource, open: Boolean(dataSource.length) });
      }
    }
    else {
      setState({ dataSource: [], open: false });
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

        setState({ dataSource: filterData, open: Boolean(filterData.length) });
      }
    }

    return getData;
  })

  const handleInputChange = (value: string) => {
    setLoading(true);
    callback()(value)
  }

  const handleSelected = (obj: DataSource) => {
    if (obj) {
      if (isMultiple) {
        handleSelectItem(obj.value);
        return;
      }

      onSelected(obj);
      setInputValue(renderText(obj));
      setState({ ...state, open: false }); // value: renderText(obj),
    }
  }

  const isActiveElementInListbox = (listboxRef: React.RefObject<HTMLUListElement>) => {
    return listboxRef.current !== null && listboxRef.current.parentElement?.contains(document.activeElement);
  }

  const handleInputBlur = (event: any) => {
    cursorRef.current = cursorPrevRef.current = -1;
    if (isActiveElementInListbox(listRef)){
      inputRef.current?.focus();
      return;
    }

    if (isMultiple && changeSelected.current) {
      changeSelected.current = false;
      onSelected(returnAsString ?  values.current.join(',') : values.current);
      setInputValue(renderTextSelected());
      setState({ dataSource: resolveData(), open: false }); // value: renderTextSelected(),
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
    if (state.open) {
      return;
    }

    setLoading(true);

    if (isHandleInitialData()) {
      setState({ ...state, open: Boolean(state.dataSource.length) })
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

  const handleFilterClear = () => {
    if (values.current.length) {
      values.current = [];
      setLoading(true);
      setState({ dataSource: resolveData(), open: true });
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
      width: Boolean(panelWidth) ? panelWidth : rootInputRef.current?.offsetWidth,
      zIndex: 'modal',
    }
  }

  const getStylesRoot = () => {
    return {
      display: inputProps?.fullWidth ? 'block' : 'inline-block',
    }
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
      <Stack justifyContent='end' direction='row' gap={ 1 } bgcolor='#F1F0EE'>
        <Button size='small' color='primary' onClick={ handleFilterClear } tabIndex={ -1 }>
          <Typography gap={ 1.5 }>Limpiar filtros</Typography>
        </Button>
      </Stack>
    )
  }

  const AutocompletarSkeleton = () => {
    const iterations = state.dataSource.length < 10 ? state.dataSource.length : 10;
    let mtb = isMultiple ? 2 : 1;

    return (
      <Box sx={{ ...getSxPropsList() }} role="container">
        {
          range(iterations).map((number: number) => (
            <Stack key={ number } direction="row">
              { isMultiple && <Skeleton animation="wave" variant="rectangular" width={ 20 } height={ 20 } sx={{ mt: 2, ml: 2, mb: 2 }}/> }
              <Skeleton animation="wave" variant="rectangular" height={ 20 } width="100%" sx={ { mt: mtb, ml: 2, mb: mtb, mr: 2 } }/>
            </Stack>
          ))
        }
      </Box>
    )
  }

  const resolveInputValue = () => {
    if (isMultiple) {
      if (values.current.length === 0){
        return '';
      }
      return inputValue || renderTextSelected();
    }

    return inputValue;
  }

  return (
    <div
      id={ id }
      style={ getStylesRoot() }
      onMouseDown={ handleMouseDown }
      onClick={ handleClick }
    >
      <InputText
        { ...props }
        inputProps={{
          ...inputProps,
          inputRef: inputRef,
          onFocus: handleInputFocus,
          onKeyDown: handleInputKeyDown,
          onBlur: handleInputBlur
        }}
        clearable={ clearable }
        delay={ delay }
        hideIcon={ hideIcon }
        icon={ MainIcon }
        onChange={ handleInputChange }
        ref={ rootInputRef }
        defaultValue={ resolveInputValue() }
      />
      {
        state.open && (
          <Fade in unmountOnExit>
            <Stack sx={{ boxShadow: 10, background: '#FFF', position: 'absolute' }}>
              { loading ?
                <AutocompletarSkeleton /> :
                <>
                  <List dense disablePadding ref={ listRef } sx={{ ...getSxPropsList() }}>
                  {
                    state.dataSource.map((option, index) => {
                      //console.log('1')
                      return (
                      <ListBoxItem
                        key={ option.value }
                        index={ index }
                        option={ option }
                        checkeable={ isMultiple }
                        onChange={ handleSelected }
                        selected={ isSelected(option) }
                        ref={ option.value === '-1' ? checkboxAllRef : null }
                      />
                    )})
                  }
                  </List>
                  { isMultiple && <ListBoxActions /> }
                </>
            }
            </Stack>
          </Fade>
        )
      }
    </div>
  )
}

Autocompletar.displayName = 'AyFAutocompletar'

export default Autocompletar;
