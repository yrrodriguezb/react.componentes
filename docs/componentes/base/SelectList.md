# &lt;SelectList /&gt;

Componente que permite representar una lista de datos de tipo **DataSource** en un control de tipo `select`.

## Props

| Nombre              | Tipo             | Valor por defecto | Descripción   |
|---------------------|------------------|-------------------|---------------|
| addItemEmphy        | boolean          | false             | Agrega un item con el valor de vacío y el texto `Ninguno` de forma predeterminada. |
| assignSelectedValue | (data: DataSource[]) => DataSource | | Función que permite seleccionar por defecto un item personalizado al montar por primera vez el componente. Es útil para buscar un item especifico según sus propiedades diferente de la propeidad `value` del objeto `DataSource` |  
| data                | DataSource[]     | []                | Fuente de datos para ser renderizados. |
| disablePortal       | boolean          | false             | Permite definir si la lista del componente se muestra en la jerarquía DOM del componente principal |
| emitSelectedValue   | boolean          | false             | Permite emitir el valor seleccionado al montar por primera vez el componente. Depende de la propiedad `assignSelectedValue` |
| error               | boolean          | false             | Permite establecer si el control tiene un error |
| errorMessage        | string           | ''                | Establece el mensaje de error que se va a renderizar |
| formControlProps    | FormControlProps |                   | Propiedades del `FormControl` según api de `React MUI` |
| id                  | string           |                   | Identificador que se asigna en el `InputLabel` y `Select` |
| inputLabelProps     | InputLabelProps  |                   | Propiedades del `InputLabel` según api de `React MUI` |
| inputLabelText      | string;          |                   | Texto que se asigna al `InputLabel` para describir el control |
| onChange            | (obj: DataSource) => void            | | Función que emite el valor seleccionado del control |
| renderItem          | (obj: DataSource) => React.ReactNode | (obj: DataSource) => &lt;MenuItem /&gt; | Función que permiter cambiar el render del item en el control |
| renderText          | (obj: DataSource) => string | (obj: DataSource) => obj.text | Función que permiter cambiar el render del texto en el item del control |
| returnObject        | boolean          | false             | Retorna el objeto original cuando los datos provienen de un servicio HTTP en una propiedad llamada `original`. | 
| selectProps         | SelectProps      |                   | Propiedades del `Select` según api de `React MUI` |
| service             | ServiceProps     | {}                | Propiedades del servicio HTTP. Las propiedades `executeOnce` y `executeOnFirstFocus` son ignoradas |
| sx                  | SxProps          | {}                | Propiedades según api de `React MUI` |
| textItemEmphy       | string           | 'Ninguno'         | Texto que se asigna al item cuando la propiedad `addItemEmphy` es verdadera |
| value               | string           |                   | Valor por defecto que se asignará al montar el componente por primera vez. A diferencia de `assignSelectedValue` este valor se basa en la propeidad `value` del objeto `DataSource`. |


## Service Props

| Nombre              | Tipo        | Valor por defecto                   | Descripción |
|---------------------|-------------|-------------------------------------|-------------|
| dataText            | string      | 'text'                              | Texto a mostrar en el elemento de la lista |
| dataValue           | string      | 'value'                             | Valor del elemento de la lista.  |
| params              | Params      | {}                                  | Objeto o funcion que retorna un objeto para enviar en la petición HTTP según método get de axios. |
| url                 | string      |                                     | URL servicio HTTP  |
| searchParam         | string      | ''                                  | Parametro de busqueda que se utiliza en el servicio HTTP |
| toDataSource        | function    | (data, returnObjet) => DataSource[] | Funciona para trasformar los datos del servicio HTTP en un DataSource válido |


## Ejemplos

### Importaciones

### Básico
```js
import SelectList from './componentes/Base/SelectList';
```

```js
<SelectList
  data={[
    { text: 'Primero', value: '1' },
    { text: 'Segundo', value: '2' },
    { text: 'Tercero', value: '3' }
  ]}
  onChange={ console.log }
  value="1"
/>
```

### Avanzado

```js
// Obteniendo datos de un servicio http 

<SelectList
  addItemEmphy
  id='select-id-example'
  service={{
    url: 'https://localhost:8000/items',
    dataText: 'descripcion',
    dataValue: 'codigo'
  }}
  onChange={ console.log }
  formControlProps={{
    sx: {
      width: '140px'
    }
  }}
  selectProps={{
    placeholder: 'grupo de libros'
  }}
/>
```

```js
// Obteniendo datos de un servicio http y personalizando el valor de selección al montar el componente por primera vez

const assignSelectedValue = (data: DataSource<Roles>[]) => {
  return data.find(o => o.original.Role === 'ADMIN');
}

<SelectList
    { ...props }
    assignSelectedValue={ assignSelectedValue }
    returnObject
    service={{
      url: `https://localhost:8000/Roles/${params()}`,
      dataText: 'Role',
      dataValue: 'Id'
    }}
    formControlProps={{
      sx: {
        width: '200px'
      }
    }}
    selectProps={{
      placeholder: 'Roles',
    }}
  />
```
