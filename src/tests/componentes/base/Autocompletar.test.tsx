import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Autocompletar from "../../../componentes/Base/Autocompletar";
import { countryListTop10 } from "../../data/countries";
import apiMock from '../../../utils/api'
import { normalizeString } from "../../../utils/fn";


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
    expect(screen.queryByRole('listbox')).toBeFalsy();
  });

  test("Debe filtrar los datos en la propiedad 'data' ségun texto en el input", async () => {
    render(<Autocompletar
      data={ countryListTop10 }
    />)

    const pattern = "afg";
    const filterData = countryListTop10.filter(c => normalizeString(c).includes(pattern));
    const element: HTMLElement | null = screen.getByRole("textbox");

    fireEvent.change(element, { target: { value: pattern } });

    await waitFor(() => expect(screen.getAllByRole('listitem').length).toBe(filterData.length), optionsWaitFor)
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

    const element: HTMLElement | null = screen.getByRole("textbox");

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

})
