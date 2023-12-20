# &lt;Autocompletar /&gt;

Componente que permite filtrar datos de tipo **DataSource** para mostralos en una lista de seleccion.

## Props

| Nombre         | Tipo                        | Valor por defecto | Descripción   |
|----------------|-----------------------------|-------------------|---------------|
| clearable      | boolean                     | false             | Agrega un botón para permite limpiar el input. Si se configura la propiedad `multiple` renderiza un componente en la parte inferior para permitir limpiar todos los elementos seleccionados |
| data           | DataSource[]                | []                | Fuente de datos para ser renderizados.  |
| delay          | number                      | 500               | Tiempo de espera para realizar la carga de datos  |
| extraData      | DataSource[]                | []                | Datos adicionales para agregar en el datasource obtenido en el servicio HTTP. Aplica únicamente si el servicio se ejecuta una sola vez según propiedad `executeOnce`. Estos datos siempre se incluyen al inicio de la lista  |
| iconElement    | () => JSX.Element           | () => SearchIcon  | Icono al final del input según propiedad endAdornment de react mui |
| hideIcon       | boolean                     | false             | Oculta el icono principal al final del input |
| id             | string                      |                   | Identificador elemento root  |
| inputProps     | InputTextProps              | {}                | Propiedades Input, extiende de la interface TextFieldProps omitiendo eventos que se usan en componente por defecto |
| multiple       | boolean, multipleProps      | {}                | Permite seleccionar multiples opciones. La propiedad `returnObject` es ignorada al emitir los datos seleccionados |
| onInputClear   | () => void                  |                   | Función que se ejecuta cuando se limpia el input text |
| onSelected     | () => void                  | () => {}          | Función que se ejecuta con el valor seleccionado |
| panelWidth     | number, string              |                   | Ancho panel de lista con los datos  |
| renderText     | (obj: DataSource) => string | (obj) => obj.text | Función que renderiza el texto del elemento ListItem y el texto al seleccionar, por defecto el valor en service.dataValueText |
| returnObject   | boolean                     | false             | Retorna el objeto original cuando los datos provienen de un servicio HTTP en una propiedad llamada `original`. |
| service        | ServiceProps                | {}                | Propiedades del servicio HTTP. |
| value          | string                      | ''                | Valor por defecto en el input text. Si el autocompletar está configurado para ejecutarse una vez o contiene datos iniciales, se asignará el primer valor que coincida con el id en la fuente de datos, de lo contrario se asigna el texto correspondiente. |


## Service Props

| Nombre              | Tipo        | Valor por defecto                   | Descripción |
|---------------------|-------------|-------------------------------------|-------------|
| dataText            | string      | 'text'                              | Texto a mostrar en el elemento de la lista |
| dataValue           | string      | 'value'                             | Valor del elemento de la lista.  |
| executeOne          | boolean     | false                               | Ejecutar el servicio una unica vez, cuando el componente es montado |
| executeOnFirstFocus | boolean     | false                               | Ejecutar el servicio una vez, cuando el input text obtiene el foco por primera vez. |
| params              | Params      | {}                                  | Objeto o funcion que retorna un objeto para enviar en la petición HTTP según método get de axios. |
| url                 | string      |                                     | URL servicio HTTP  |
| searchParam         | string      | ''                                  | Parametro de busqueda que se utiliza en el servicio HTTP |
| toDataSource        | function    | (data, returnObjet) => DataSource[] | Funciona para trasformar los datos del servicio HTTP en un DataSource válido |

> **NOTA**: Si las propíedades `executeOne` y `executeOnFirstFocus` son verdaderas el servivio HTTP se ejecuta una única vez el primer foco del input y no cuando el componentes es montado.

## Multiple Props

| Nombre         | Tipo                       | Valor por defecto          | Descripción |
|----------------|----------------------------|----------------------------|-------------|
| addListItemAll | boolean                    | false   | Agrega un item de tipo DataSource en la primera posición de los datos. Elemento por ***default***: { text: 'Todos', value: '-1' } |
| returnAsString | boolean                    | false   | Emite los datos seleccionados en un string separado por coma. Si la propiedad no es verdadera se retorna un array. |
| textSelected   | (count: number) => string  | `{count} item(s) seleccionado(s)`  | Valor del placeholder que se asigna al dispararse el evento blur del input |
| textItemAll    | string                     | 'Todos' | Texto a mostrar en el elemento de la lista. |

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
// Obteniendo datos de un servicio http y manipulando los datos obtenidos

<Autocompletar
  service={{
    url:'https://localhost/search/users/',
    searchParam: 'q',
    toDataSource: (data: any[]) => {
      return data.map((d: any) => {
        const { user } = d;
        return { text: user.name, value: user.id };
      })
    }
  }}
  onSelected={ console.log }
  returnObject
/>
```

```js
// Obteniendo datos de un servicio http una sola vez y asignando la propiedad dataText y dataValue

<Autocompletar
  service={{
    dataValue: "username",
    dataValue: "id"
    executeOnce: true,
    url:'https://localhost/search/users/',
  }}
  onSelected={ console.log }
  returnObject
/>
```

```js
// Obteniendo datos de un servicio http una sola vez y asignando la propiedad dataText, dataValue y params

<Autocompletar
  service={{
    dataText: "username",
    dataValue: "id"
    executeOnce: true,
    params: (search: string) => {
      return {
        q: search,
        custom: "custom",
        other: true
      }
    },
    url:'https://localhost/search/users/',
  }}
  onSelected={ console.log }
  returnObject
/>
```

```js
// Autocompletar con selección multiple

<Autocompletar
  multiple={{
    addListItemAll: true,
    returnAsString: true,
    textItemAll: "-- All --",
    textSelected: (count: number) => `Count: ${count}`;
  }}
  service={{
    dataText: "username",
    dataValue: "id"
    executeOnce: true,
    url:'https://localhost/search/users/',
  }}
  onSelected={ console.log }
  returnObject
/>
```
```js
// Obteniendo datos de un servicio http una sola vez y asignando la propiedad extraData

<Autocompletar
  service={{
    executeOnce: true,
    url:'https://localhost/tipos-documentos/',
  }}
  extraData={[
    { value: '-1', text: 'Diferentes a CP' },
    { value: '-2', text: 'Solo tipos AJ y CP' }
  ]}
  onSelected={ console.log }
/>
```
