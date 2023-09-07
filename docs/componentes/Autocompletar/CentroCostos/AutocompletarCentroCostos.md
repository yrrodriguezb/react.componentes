# &lt;Autocompletar /&gt;

Componente que permite filtrar datos de tipo **Centro de costos** para mostralos en una lista de seleccion.

## Props

| Nombre         | Tipo                        | Valor por defecto | Descripción   |
|----------------|-----------------------------|-------------------|---------------|
| baseURL        | string                      | ''                | URL base del servicio que se usará para la consulta de los datos |
| fullWidth      | boolean                     | false             | Establece el ancho maximo que puede ocupar segun elemento padre |
| multiple       | boolean                     | false             | Permite que el control sea de seleccion multiple |
| id             | string                      |                   | Identificador elemento root  |
| inputProps     | InputTextProps              | {}                | Propiedades Input, extiende de la interface TextFieldProps omitiendo eventos que se usan en componente por defecto |
| onSelected     | () => void                  | () => {}          | Funcion que se ejecuta con el valor seleccionado |
| value          | string                      | ''                | Valor por defecto en el input text. Si el autocompletar está configurado para ejecutarse una vez o contiene datos iniciales, se asignará el primer valor que coincida con el id en la fuente de datos, de lo contrario se asigna el texto correspondiente. |

## Ejemplos

### Importaciones

```js
import AutocompletarCentroCostos, { 
  AutocompletarCentroCostosProps 
} from './componentes/Autocompletar/CentroCostos/AutocompletarCentroCostos';
```

### Modo de uso


```js
const props: AutocompletarCentroCostosProps = {
  baseURL: 'https://localhost:8000/',
  multiple: true,
  onSelected: console.log
}
```

```js
<AutocompletarCentroCostos
  { ...props }
/>
```
