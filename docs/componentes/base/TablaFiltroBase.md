# &lt;TablaFiltroBase /&gt;

Componente base que permite renderizar un array de datos de tipo **DataSource** para mostralos en una tabla que permite filtran de forma masiva.

## Props

| Nombre         | Tipo        | Valor por defecto          | Descripción |
|----------------|-------------|----------------------------|-------------|
| data           | DataSource  |                            | Fuente de datos para ser renderizados.  |
| headers        | string[]    | [ 'Código', 'Descripcion'] | Array que se renderizaran como encabezados en la tabla de datos.   |
| inDialog       | boolean     | false   | Si es **true** renderizar el componente en un componente tipo Dialog. |
| onClose        | function    | () => {} | Controlador post cierre del componente.    |
| onSelected     | function    | () => {} | Controlador para emitir los datos seleccionados. |
| open           | boolean     | false    | Indica el estado actual del componente, oculto o viisble. |
| returnAsString | boolean     | false    | Si es **true**, retorna los datos seleccionados en un string concatenado por coma (,), por defecto los retorna en un array. |
| title          | string      | empty    | Titulo del componente que se esta representado. |

## Ejemplos

### Importaciones

### Básico
```js
import TablaFiltroBase, { 
  DatosEmitidos 
} from './componentes/Base/TablaFiltroBase'
```

```js
<TablaFiltroBase 
  data={[
    { text: 'Primero', value: '1' },
    { text: 'Segundo', value: '2' },
    { text: 'Tercero', value: '3' }
  ]}
  open={true}
  title="Titulo componente"
  returnAsString
/>
```

### Avanzado

```js
import { useState } from 'react';
import Button  from '@mui/material/Button';
import TablaFiltroBase, { 
  DataSource, 
  DatosEmitidos 
} from './componentes/Base/TablaFiltroBase'

const [open, setOpen] = useState(false)

function createData(
  value: string,
  text: string
): DataSource {
  return {
    value, 
    text
  };
}


const data = [
  createData("01", "Cupcake"),
  createData("0101", "Donut"),
  createData("010101", "Eclair"),
  createData("010102", "Frozen yoghurt"),
  createData("02", "Gingerbread"),
  createData("0202", "Honeycomb"),
  createData("020201", "Ice cream sandwich"),
  createData("020202", "Jelly Bean"),
  createData("020203", "KitKat"),
  createData("03", "Lollipop"),
  createData("0301", "Marshmallow"),
  createData("030101", "Nougat"),
  createData("030102", "Oreo")
];
```

```html
<Button 
  variant="contained" 
  onClick={ () => { setOpen(true) }}
>
  Open
</Button>

<TablaFiltroBase 
  data={data}
  inDialog
  onClose={() => { setOpen(false); } }
  onSelected={(d: DatosEmitidos) => { console.log(d); } }
  open={open}
  title="Centros de Costos"
  returnAsString
/>  
```
