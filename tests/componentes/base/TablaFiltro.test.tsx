import { render, screen, waitFor } from "@testing-library/react";
import  TablaFiltro from "../../../src/componentes/Base/TablaFiltro";
import { dataSource } from "../../data/base/DataSource";
import apiMock from "../../../src/utils/api";

const testidComponent = "root";

jest.mock('../../../src/utils/api', () => ({
  get: jest.fn()
}));

const axiosMockGet = apiMock.get as jest.Mock;

describe("Pruebas en <TablaFiltro />", () => {
  const optionsWaitFor = { interval: 500 };

  beforeEach(() => {
    jest.clearAllMocks();
  })

  it('Debe realizar el llamado http para renderizar el componente', async () => {
    axiosMockGet.mockReturnValue({
      data: dataSource
    });

    render(<TablaFiltro data-testid={testidComponent}
      urlService="http://localhost:3000"
      open
    />)

    await waitFor(() => expect(axiosMockGet).toHaveBeenCalledWith("http://localhost:3000"), optionsWaitFor);
    await waitFor(() => {
      const tbody = screen.getAllByRole('tbody-row');
      expect(tbody.length).toBe(dataSource.length)
    }, optionsWaitFor);
  })
})
