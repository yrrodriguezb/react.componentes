import {  cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AutocompletarCentroCostos from "../../../../componentes/Autocompletar/CentroCostos/AutocompletarCentroCostos";
import { ReactMuiRole } from "../../../utils/enum/mui/roles";
import apiMock from "../../../../utils/api";
import { dataSource } from "../../../data";

const onSelected = jest.fn();
const testId = "autocompletar-centro-costos-id";

let Component: any = null;

const response = {
  data: dataSource.map((el: any) => ({ id: el.value, title: el.text }))
}

jest.mock('../../../../utils/api', () => ({
  get: jest.fn()
}));

const apiMockGet = apiMock.get as jest.Mock;

describe('Pruebas en <AutocompletarCentroCostos />', () => {
  const optionsWaitFor = { interval: 1000, timeout: 1000 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    Component = () => (
      <AutocompletarCentroCostos
        data-testid={ testId }
        baseURL='http://localhost:8000/'
        onSelected={ onSelected }
        multiple
        inputProps={{
          name: 'autocompletar-centros-costos'
        }}
      />
    )
  })

  test('Debe renderizar el componente de forma adecuada', async () => {
    apiMockGet.mockImplementation(() => response);

    render(<Component />);

    await waitFor(() => {
      const element = screen.queryByTestId(testId);
      expect(element).toBeTruthy()
    }, optionsWaitFor)
  });

  test('Debe renderizar el componente con funcionalidad multiple', async () => {
    apiMockGet.mockReturnValue(response)

    render(<Component />);
    const element: HTMLElement | null = await screen.findByRole(ReactMuiRole.TextBox);
    fireEvent.focus(element);

    await waitFor(() => {
      const checkboxList = screen.getAllByRole(ReactMuiRole.CheckBox);
      expect(checkboxList.length).toBe(response.data.length + 1);
    }, optionsWaitFor)
  });


  afterEach(() => {
    cleanup();
  })
})
