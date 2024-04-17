# Storage

Utilidades del paquete de **@yrrodriguezb/react-components** para administrar el localStorage del navegador. 

## Lista de funciones disponibles en el objeto storage

| Nombre    | Tipo                                            | Descripción                                                           |
|-----------|-------------------------------------------------|-----------------------------------------------------------------------|
| contains  | (pattern: RegExp) => StorageDefinition[]        | Función que retorna lista de items según patrón de busqueda           |
| create    | (name: string, value: string) => void           | Función que permite crear un item                                     |
| delete    | (name: string) => void                          | Función que permite eliminar un item                                  |
| deleteAll | (pattern: RegExp) => void                       | Función que permite eliminar varios items según el patrón de busqueda |
| get       | (name: string) => StorageDefinition &#124; null | Función que retorna un item según su nombre                           |
| getAll    | () => StorageDefinition[]                       | Función que retorna todas los items                                   |
| getValue  | (name: string) => string &#124; null            | Función que devuelve el valor de un item                              |
| setValue  | (name: string, value: string) => void           | Función que establece el valor de un item                             |

## Lista de Alias de las funciones disponibles fuera del objeto storage

### NOTA

Los alias son utiles para exportar cada funcionalidad por separado sin necesidad de extraer cada una por separado del objeto `storage`


| Nombre    | Alias            |
|-----------|------------------|
| contains  | containsStorage  |
| create    | createStorage    |
| delete    | deleteStorage    |
| deleteAll | deleteAllStorage |
| get       | getStorage       |
| getAll    | getAllStorage    |
| getValue  | getStorageValue  |
| setValue  | setStorageValue  |



## Propiedades CookieDefinition

| Nombre | Tipo    | Descripción                                |
|--------|---------|--------------------------------------------|
| name   | string  | Nombre del item en el `localStorage`       |
| value  | string  | Valor actual del item en el `localStorage` |

## Modo de uso

### Utilizando el objeto cookie

```js
// Importaciones
import { storage } from '@ayfdev/comunes'

storage.create("KEY_1", "VALUE_1")
storage.create("KEY_2", "VALUE_2")
storage.create("KEY_3", "VALUE_3")

console.log(storage.getAll())

// output:
[
    {
        name: "KEY_1",
        value: "VALUE_1"
    },
    {
        name: "KEY_2",
        value: "VALUE_2"
    },
    {
        name: "KEY_3",
        value: "VALUE_3"
    }
]
```

### Utilizando los alias

```js
// Importaciones
import { createStorage, getStorage } from '@ayfdev/comunes'

createCookie("KEY", "VALUE")
console.log(getStorage("KEY"))

// output:
{ name: 'KEY', value: 'VALUE' }
```
