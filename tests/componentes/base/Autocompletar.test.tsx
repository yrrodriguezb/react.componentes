import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Autocompletar from "../../../src/componentes/Base/Autocompletar";
import { countryListTop10, dataSource, numbers } from "../../data";
import apiMock from '../../../src/utils/api'
import { normalizeString } from "../../../src/utils/fn";
import { ReactMuiRole } from "../../utils/enum/mui/roles";
import { DataSource } from "../../../src/interfaces";
import { EMPTY } from "../../../src/utils";


jest.mock('../../../src/utils/api', () => ({
  get: jest.fn()
}));

const response = {
  data: countryListTop10.map(country => ({ text: country, value: country }))
};

const httpMock = apiMock.get as jest.Mock;

describe("Pruebas en <Autocompletar />", () => {
  const testId = "autocompletar-id";
  const optionsWaitFor = { interval: 500 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  test("Debe renderizar unicamente el input text", () => {
    render(
      <Autocompletar
        data-testid={ testId }
      />
    );

    expect(screen.getByTestId(testId)).toBeTruthy();
    expect(screen.queryByRole(ReactMuiRole.ListBox)).toBeFalsy();
  });

  test("Debe filtrar los datos en la propiedad 'data' ségun texto en el input", async () => {
    render(<Autocompletar
      data={ countryListTop10 }
    />)

    const pattern = "afg";
    const filterData = countryListTop10.filter(c => normalizeString(c).includes(pattern));
    const element: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);

    fireEvent.change(element, { target: { value: pattern } });

    await waitFor(() => expect(screen.getAllByRole(ReactMuiRole.ListItem).length).toBe(filterData.length), optionsWaitFor)
  });

  test("Debe validar que el input text tenga el valor seleccionado segun propiedad renderText", async () => {
    const renderText = (obj: DataSource) => `[Value]: ${obj.value} - [Text]: ${obj.text}`;

    render(
      <Autocompletar
        data={ dataSource }
        renderText={ renderText }
      />
    );

    let items: HTMLElement[] = [];
    const input: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);
    fireEvent.focusIn(input);

    await waitFor(() => {
      items = screen.getAllByRole(ReactMuiRole.ListItem);
      expect(items.length).toBe(dataSource.length);
    }, optionsWaitFor)

    fireEvent.mouseDown(items[0]);
    expect(input).toHaveValue(renderText(dataSource[0]));

    fireEvent.blur(input)
    fireEvent.focusIn(input);

    await waitFor(() => {
      items = screen.getAllByRole(ReactMuiRole.ListItem);
    }, optionsWaitFor)

    fireEvent.mouseDown(items[items.length - 1]);
    expect(input).toHaveValue(renderText(dataSource[dataSource.length - 1]));
  });

  test("Debe ejecutar el servicio HTTP una sola vez", async () => {
    httpMock.mockImplementation(() => response);

    render(<Autocompletar
      service={{
        url: 'https://localhost:8000',
        executeOnce: true
      }}
    />);

    expect(httpMock).toHaveBeenCalledTimes(1);
    expect(httpMock).not.toHaveBeenCalledTimes(2);
    expect(httpMock).toHaveBeenCalledWith('https://localhost:8000',  { params: {} });
    await waitFor(() => expect(httpMock).toHaveReturnedWith(response), optionsWaitFor);
  });

  test('Debe ejecutar el servicio HTTP cada vez que cambie el input text segun delay', async () => {
    httpMock.mockReturnValue(response)

    render(<Autocompletar
      data-testid={ testId }
      clearable
      service={{
        url: 'https://localhost:8000',
        searchParam: 'q'
      }}
    />);

    const element: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);

    fireEvent.change(element, { target: { value: 'a' } });
    await waitFor(() => expect(httpMock).toHaveBeenCalledWith('https://localhost:8000',  { params: { q : 'a' } }));

    fireEvent.change(element, { target: { value: 'af' } });
    await waitFor(() => expect(httpMock).toHaveBeenCalledWith('https://localhost:8000',  { params: { q : 'af' } }));

    expect(httpMock).toHaveBeenCalledTimes(2);

    fireEvent.change(element, { target: { value: 'afg' } });
    fireEvent.change(element, { target: { value: 'afga' } });
    await waitFor(() => expect(httpMock).toHaveBeenCalledWith('https://localhost:8000',  { params: { q : 'afga' } }));

    expect(httpMock).toHaveBeenCalledTimes(3);
  });

  test('Debe permitir seleccionar de forma multiple', async () => {
    const Component = () => (
      <Autocompletar
        data-testid={ testId }
        data={ numbers  }
        multiple={{
          addListItemAll: true
        }}
      />
    );

    render(<Component />);
    const element: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);
    fireEvent.focusIn(element);

    const skeleton: HTMLElement | null = screen.queryByRole(ReactMuiRole.Container);
    expect(skeleton).toBeInTheDocument();

    await waitFor(() => {
      expect(skeleton).not.toBeInTheDocument();
    })

    await waitFor(() => {
      const checkboxlist: HTMLElement[] | null = screen.queryAllByRole(ReactMuiRole.CheckBox);
      // Mas uno por el item de todos segun propiedad addListItemAll
      const countChecbox = numbers.length + 1;
      expect(checkboxlist.length).toBe(countChecbox);
    })
  });

  test('Debe emitir los datos separados por coma (,) cuando el control es de seleccion multiple', async () => {
    const selected = jest.fn();

    const Component = () => (
      <Autocompletar
        data-testid={ testId }
        data={ numbers }
        multiple={{
          addListItemAll: true,
          returnAsString: true
        }}
        onSelected={ selected }
      />
    );

    render(<Component />);
    const element: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);
    fireEvent.focusIn(element);

    let checkboxList: HTMLElement[] | null = [];
    const emittedData = numbers.map(d => d.value).join(',');

    await waitFor(() => {
      checkboxList = screen.queryAllByRole(ReactMuiRole.CheckBox);
      expect(checkboxList[0]).toBeInTheDocument()
    })

    fireEvent.mouseDown(checkboxList[0]);

    await waitFor(() => {
      fireEvent.blur(element)
      expect(selected).toHaveBeenCalledTimes(1);
    })

    expect(selected).toHaveBeenCalledWith(emittedData);
  });

  test("Debe ejecutar el servicio HTTP una sola vez en el primer focus del input text y cada vez que se escriba", async () => {
    let calls = 1;
    httpMock.mockReturnValue(response);

    render(
      <Autocompletar
        service={{
          url: 'https://localhost:8000',
          executeOnFirstFocus: true
        }}
      />
    );

    const input: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);
    fireEvent.focusIn(input);

    // se usa waitFor para esperar el primer llamado HTTP
    await waitFor(() => expect(httpMock).toHaveBeenCalledTimes(calls), optionsWaitFor);

    fireEvent.blur(input);
    fireEvent.focusIn(input);
    expect(httpMock).toHaveBeenCalledTimes(calls);

    fireEvent.blur(input);
    fireEvent.focusIn(input);
    expect(httpMock).toHaveBeenCalledTimes(calls);

    calls = calls + 1;
    fireEvent.change(input, { target: { value: "Fin" } });
    await waitFor(() => expect(httpMock).toHaveBeenCalledTimes(calls), optionsWaitFor);

    calls = calls + 1;
    fireEvent.change(input, { target: { value: "Financiero" } });
    await waitFor(() => expect(httpMock).toHaveBeenCalledTimes(calls), optionsWaitFor);
  });

  test("Debe ejecutar el servicio HTTP una sola vez en el primer focus del input text cuando executeOnFirstFocus y executeOnce son verdaderas", async () => {
    let calls = 1;
    httpMock.mockReturnValue(response);

    render(
      <Autocompletar
        service={{
          url: 'https://localhost:8000',
          executeOnFirstFocus: true,
          executeOnce: true
        }}
      />
    );

    const input: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);
    fireEvent.focusIn(input);

    // se usa waitFor para esperar el primer llamado HTTP
    await waitFor(() => expect(httpMock).toHaveBeenCalledTimes(calls), optionsWaitFor);

    fireEvent.blur(input);
    fireEvent.focusIn(input);
    expect(httpMock).toHaveBeenCalledTimes(calls);

    fireEvent.change(input, { target: { value: "Fin" } });
    await waitFor(() => expect(httpMock).toHaveBeenCalledTimes(calls), optionsWaitFor);

    fireEvent.change(input, { target: { value: "Financiero" } });
    await waitFor(() => expect(httpMock).toHaveBeenCalledTimes(calls), optionsWaitFor);
  });


  test("Debe mostrar el valor del input segun propiedad value si el value esta el datasource", async () => {
    const value = '10';
    const renderText = (obj: DataSource) => `[Value]: ${obj.value} - [Text]: ${obj.text}`;

    render(
      <Autocompletar
        data={ dataSource }
        renderText={ renderText }
        value={ value }
      />
    );

    const obj = dataSource.find((el: DataSource) => el.value === value);
    let  input: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);
    expect(input).toHaveValue(renderText(obj!));
  });

  test("Debe mostrar el valor del input segun propiedad value si el value no se encuentra en el datasource", async () => {
    const value = "Pruebas Value Input";

    render(
      <Autocompletar
        data={ dataSource }
        value={ value }
      />
    );

    const input = screen.getByRole(ReactMuiRole.TextBox);
    expect(input).toHaveValue(value);
  });

  test('Debe limpiar el input al seleccionar un item', async () => {
    const onSelected = jest.fn();

    render(
      <Autocompletar
        data={ dataSource }
        onSelected={ onSelected }
        clearInputOnSelect
      />
    )

    let items: HTMLElement[] = [];
    const input: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);

    fireEvent.focusIn(input);
    items = await screen.findAllByRole(ReactMuiRole.ListItem);
    fireEvent.mouseDown(items[0]);
    expect(onSelected).toHaveBeenCalledWith(dataSource[0]);
    expect(input).toHaveValue(EMPTY);
    fireEvent.blur(input);

    onSelected.mockClear();

    fireEvent.focusIn(input);
    items = await screen.findAllByRole(ReactMuiRole.ListItem);
    fireEvent.mouseDown(items[items.length - 1]);
    expect(onSelected).toHaveBeenCalledWith(dataSource[dataSource.length - 1]);
    expect(input).toHaveValue(EMPTY);
  });

  test("Debe filtrar los datos ségun la propiedad filter", async () => {
    const customFilter = (pattern: string, obj: DataSource) => {
      const _value = normalizeString(obj.value);
      return _value.includes(pattern) && obj.text.startsWith("An");
    }

    const filterMock = jest.fn(customFilter);

    render(<Autocompletar
      data={ countryListTop10 }
      filter={ filterMock }
    />)

    const pattern = "a";
    const element: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);
    fireEvent.change(element, { target: { value: pattern } });

    await waitFor(() => expect(filterMock).toHaveBeenCalled(), optionsWaitFor);
    expect(filterMock).toHaveBeenCalledTimes(countryListTop10.length)

    const filterData = countryListTop10.filter(c => customFilter(pattern, { value: c, text: c }));
    const results = filterMock.mock.results.filter(r => r.value);
    expect(filterData.length).toBe(results.length);
  });

  test("Debe ejecutar la funcion onInputClear si el valor del input es vacio", async () => {
    const onInputClear = jest.fn();

    render(<Autocompletar
      clearable
      data={ countryListTop10 }
      executeInputClearIfEmpty
      onInputClear={ onInputClear }
    />)

    const input: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);

    fireEvent.change(input, { target: { value: "pruebas" } });
    fireEvent.change(input, { target: { value: "" } });
    await waitFor(() => expect(onInputClear).toHaveBeenCalledTimes(1), optionsWaitFor)

    fireEvent.change(input, { target: { value: "pruebas" } });
    const clearButton =  screen.getByRole(ReactMuiRole.ClearButton);
    expect(clearButton).toBeVisible();
    fireEvent.mouseDown(clearButton);
    expect(onInputClear).toHaveBeenCalledTimes(2);
  });

  test('Debe emitir el valor seleccionado solo una vez al hacer clic en el mismo item varias veces', async () => {
    const onSelected = jest.fn();

    render(<Autocompletar
      data={ countryListTop10 }
      onSelected={ onSelected }
    />);

    const validate = async (el: HTMLElement, indexItem: number) => {
      fireEvent.focusIn(el);
      const items = await screen.findAllByRole(ReactMuiRole.ListItem);
      fireEvent.mouseDown(items[indexItem]);
    }

    const input: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);

    await validate(input, 0);
    await validate(input, 0);
    await validate(input, 1);
    await validate(input, 2);
    await validate(input, 2);

    expect(onSelected).toHaveBeenCalledTimes(3);
  })
})
