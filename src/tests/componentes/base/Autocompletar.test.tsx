import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Autocompletar from "../../../componentes/Base/Autocompletar";
import { countryListTop10, dataSource, numbers } from "../../data";
import apiMock from '../../../utils/api'
import { normalizeString } from "../../../utils/fn";
import { ReactMuiRole } from "../../utils/enum/mui/roles";
import { DataSource } from "../../../interfaces";


jest.mock('../../../utils/api', () => ({
  get: jest.fn()
}));

const response = {
  data: countryListTop10.map(country => ({ text: country, value: country }))
};

const apiMockGet = apiMock.get as jest.Mock;

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

    await waitFor(() => expect(screen.getAllByRole('listitem').length).toBe(filterData.length), optionsWaitFor)
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
    apiMockGet.mockImplementation(() => response);

    render(<Autocompletar
      service={{
        url: 'https://localhost:8000',
        executeOnce: true,
      }}
    />);

    expect(apiMockGet).toHaveBeenCalledTimes(1);
    expect(apiMockGet).not.toHaveBeenCalledTimes(2);
    expect(apiMockGet).toHaveBeenCalledWith('https://localhost:8000',  { params: {} });
    await waitFor(() => expect(apiMockGet).toHaveReturnedWith(response), optionsWaitFor);
  });

  test('Debe ejecutar el servicio HTTP cada vez que cambie el input text segun delay', async () => {
    apiMockGet.mockReturnValue(response)

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
    await waitFor(() => expect(apiMockGet).toHaveBeenCalledWith('https://localhost:8000',  { params: { q : 'a' } }));

    fireEvent.change(element, { target: { value: 'af' } });
    await waitFor(() => expect(apiMockGet).toHaveBeenCalledWith('https://localhost:8000',  { params: { q : 'af' } }));

    expect(apiMockGet).toHaveBeenCalledTimes(2);

    fireEvent.change(element, { target: { value: 'afg' } });
    fireEvent.change(element, { target: { value: 'afga' } });
    await waitFor(() => expect(apiMockGet).toHaveBeenCalledWith('https://localhost:8000',  { params: { q : 'afga' } }));

    expect(apiMockGet).toHaveBeenCalledTimes(3);
  });

  test('Debe permitir seleccionar de forma multiple', async () => {
    apiMockGet.mockReturnValue(response);

    const Component = () => (
      <Autocompletar
        data-testid={ testId }
        data={ numbers  }
        multiple={{
          addListItemAll: true
        }}
      />
    );

    const { rerender } = render(<Component />);
    const element: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);
    fireEvent.focusIn(element);

    const skeleton: HTMLElement | null = screen.queryByRole(ReactMuiRole.Container);
    expect(skeleton).toBeInTheDocument();

    rerender(<Component />);

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

    const { rerender } = render(<Component />);
    const element: HTMLElement | null = screen.getByRole(ReactMuiRole.TextBox);
    fireEvent.focusIn(element);
    rerender(<Component />);

    let checkboxList: HTMLElement[] | null = [];
    const emittedData = numbers.map(d => d.value).join(',');

    await waitFor(() => {
      checkboxList = screen.queryAllByRole(ReactMuiRole.CheckBox);
      expect(checkboxList[0]).toBeInTheDocument()
    })

    fireEvent.mouseDown(checkboxList[0]);
    rerender(<Component/>);
    fireEvent.blur(element)

    expect(selected).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenCalledWith(emittedData);
  })

  test("Debe ejecutar el servicio HTTP una sola vez en el primer focus del input text", async () => {
    const calls = 1;
    apiMockGet.mockReturnValue(response);

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
    await waitFor(() => expect(apiMockGet).toHaveBeenCalledTimes(calls), optionsWaitFor);

    fireEvent.blur(input);
    fireEvent.focusIn(input);
    expect(apiMockGet).toHaveBeenCalledTimes(calls);

    fireEvent.blur(input);
    fireEvent.focusIn(input);
    expect(apiMockGet).toHaveBeenCalledTimes(calls);
  });
})
