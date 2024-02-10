import { render, screen, waitFor } from "@testing-library/react";
import SelectList from "../../../src/componentes/Base/SelectList";
import { dataSource, countryListTop10 } from "../../data";
import apiMock from '../../../src/utils/api'
import { ReactMuiRole } from "../../utils/enum/mui/roles";


jest.mock('../../../src/utils/api', () => ({
  get: jest.fn()
}));

const response = {
  datos: countryListTop10.map(country => ({ text: country, value: country }))
};

const httpMock = apiMock.get as jest.Mock;

describe("Pruebas en <SelectList />", () => {
  const testId = "select-list-id";
  const optionsWaitFor = { interval: 500 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  test('Debe renderizar de forma adecuada', () => {
    const data = [ ...dataSource ];

    render(<SelectList
      data-testid={ testId }
      data={ data }
    />);

    const element = screen.getByTestId(testId)
    expect(element).toBeInTheDocument();
  })

  test('Debe llamar el servicio HTTP de forma adecuada una sola vez', async () => {
    httpMock.mockImplementation(() => response);

    render(<SelectList
      data-testid={ testId }
      service={{
        url: 'https://localhost:8000',
      }}
    />);

    expect(httpMock).toHaveBeenCalledTimes(1);
    expect(httpMock).not.toHaveBeenCalledTimes(2);
    expect(httpMock).toHaveBeenCalledWith('https://localhost:8000', { params: {} });
    await waitFor(() => expect(httpMock).toHaveReturnedWith(response), optionsWaitFor);
  })

  test('Debe renderizar los datos segun la propeidad data', () => {
    const data = [ ...response.datos ];
    const props = { data, selectProps: { open: true } };

    render(<SelectList { ...props }/>);
    const options = screen.queryAllByRole(ReactMuiRole.Option);
    expect(options.length).toBe(data.length);
  })

  test('Debe ocultarse el elemento si no tiene datos segun respuesta del servicio HTTP', async () => {
    httpMock.mockImplementation(() => ({ data: [] }));

    render(<SelectList
      autoHidden
      data-testid={ testId }
      service={{
        url: 'https://localhost:8000',
      }}
    />);

    expect(httpMock).toHaveBeenCalledTimes(1);

    const element = screen.getByTestId(testId);
    await waitFor(() => expect(element).not.toBeInTheDocument());
  });
});
