# &lt;Autocompletar /&gt;

Componente que permite filtrar datos de tipo **DataSource** para mostralos en una lista de seleccion.

## Props

| Nombre         | Tipo        | Valor por defecto          | Descripción |
|----------------|-------------|----------------------------|-------------|
| clearable      | boolean     | false    | Permite limpiar el input |
| data           | DataSource  |          | Fuente de datos para ser renderizados.  |
| delay          | number      | 500      | Tiempo de espere para realizar la carga de datos  |
| iconElement    | () => JSX.Element | () => SearchIcon   | Icono al final del input según propiedad endAdornment de react mui |
| hideIcon       | boolean     | false    | Oculta el icono al final del input |
| id             | string      |          | Identificador elemento root  |
| inputProps     | InputTextProps |       | Propiedades Input, extiende de la interface TextFieldProps omitiendo eventos que se usan en componente por defecto |
| onSelected     | function    | () => {} | Funciona que se ejecuta con el valor seleccionado |
| panelWidth     | number, string |       | Ancho panel de lista con los datos  |
| renderText     | function    | (obj) => e.text | Función que renderiza el texto del elemento ListItem y el texto al seleccionar, por defecto el valor en service.dataValueText |
| returnObject   | boolean     | false    | Retorna objeto original cuando los datos provienen de un servicio HTTP en una propiedad llamada 'original'. |
| service        | ServiceProps | {} | Propiedades del servicio HTTP. |


## Service Props

| Nombre         | Tipo        | Valor por defecto          | Descripción |
|----------------|-------------|----------------------------|-------------|
| executeOne     | boolean     | false    | Ejecutar el servicio una unica vez, cuando el componente es montado |
| dataText       | string      | 'text'   | Texto a mostrar en el elemento de la lista |
| dataValue      | string      | 'value'  | Valor del elemento de la lista.  |
| params         | Params      | {}       | Objeto o funcion que retorna un objeto para enviar en la petición HTTP según método get de axios. |
| url            | string      |          | URL servicio HTTP  |
| searchParam    | string      | ''      | Parametro de busqueda que se utiliza en el servicio HTTP |
| toDataSource   | function    | (data, returnObjet) => DataSource[] | Funciona para trasformar los datos del servicio HTTP en un DataSource válido |

## Ejemplos

### Importaciones

### Básico
```js
import Autocompletar from './componentes/Base/Autocompletar'
```

```js
<Autocompletar
  data={[
    'Primero',
    'Segundo',
    'Tercero',
    'Cuarto',
    'Quinto',
    'Sexto',
    'Septimo',
    'Octavo'
  ]}
  onSelected={ (e) => { console.log(e); } }
/>

// or

<Autocompletar
  data={[
    { text: 'Primero', value: '1' },
    { text: 'Segundo', value: '2' },
    { text: 'Tercero', value: '3' }
  ]}
  onSelected={ (e) => { console.log(e); } }
/>
```

### Avanzado

```js
<Autocompletar
  service={{
    url:'https://localhost/search/users/',
    dataText:'name',
    dataValue:'id',
    searchParam: 'q',
    toDataSource: (data: any[]) => {
      return data.map((d: any) => {
        const { user } = d;
        return { text: user.name, value: user.id }
      })
    }
  }}
  onSelected={ (e) => { console.log(e); } }
  returnObject
/>
```
