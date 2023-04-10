import { fireEvent, render, screen } from "@testing-library/react";
import TablaFiltroBase, { TablaFiltroBaseProps } from "../../../componentes/Base/TablaFiltroBase";
import { dataSource } from "../../data/";

const testidComponent = "root";

const props: TablaFiltroBaseProps = {
  data: dataSource,
  open: true
}

describe('Pruebas en <TablaBase />', () => {
  test('Deberia renderizar los elementos según los datos de la propiedad "data"', () => {
    render(
      <TablaFiltroBase
        data-testid={testidComponent}
        { ...props }
      />
    );

    const element: HTMLElement | null = screen.getByTestId(testidComponent);
    expect(element).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access
    expect(element.querySelectorAll('tbody > tr').length).toBe(props.data.length);
  });

  test('Deberia renderizar el componente en un Dialog', () => {
    render(
      <TablaFiltroBase
        inDialog
        { ...props }
      />
    );

    const element: HTMLElement = screen.getByRole("dialog");
    expect(element).toBeInTheDocument()
  });

  test('Deberia llamar la funcion onClose y retornar los valores segun los datos en la propiedad data', () => {
    const handleOnClose = jest.fn();
    const selected = props.data.map(e => e.value);

    render(
      <TablaFiltroBase
        onClose={handleOnClose}
        { ...props }
      />
    );

    const btnClose = screen.getByRole("btnCloseTable");
    expect(btnClose).toBeTruthy();

    fireEvent.click(btnClose);
    expect(handleOnClose).toHaveBeenCalledTimes(1);

    handleOnClose(selected)
    const received = handleOnClose.mock.calls[1][0]
    expect(received.length).toBe(selected.length);
    expect(received[received.length - 1]).toBe(selected[selected.length - 1]);
  });

  test('Deberia retornar los datos en la propiedad data en formato string separados por coma (,)', () => {
    const handleOnClose = jest.fn();
    const selected = props.data
      .map(e => e.value)
      .join(',');

    render(
      <TablaFiltroBase
        onClose={handleOnClose}
        returnAsString
        { ...props }
      />
    );

    handleOnClose(selected)
    const received = handleOnClose.mock.calls[0][0];

    expect(received.length).toBe(selected.length);
    expect(received).toEqual(selected);
  });
})
