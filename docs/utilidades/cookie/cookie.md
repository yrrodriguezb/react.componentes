# Cookie

Utilidades del paquete de **@yrrodriguezb/react-components** para administrar las cookies del navegador. 

## Lista de funciones disponibles en el objeto cookie

| Nombre    | Tipo                                                  | Descripción                                |
|-----------|-------------------------------------------------------|----------------------------------------------------------------|
| contains  | (pattern: RegExp) => CookieDefinition[]               | Funcion que retorna lista de cookies según patrón de busqueda  |
| create    | (name: string, value: string, path?: string) => void  | Función que permite crear una cookie                           |
| delete    | (name: string, path?: string) => void                 | Función que permite eliminar una cookie                        |
| deleteAll | (pattern: RegExp) => void                             | Función que permite eliminar varias cookies según el patrón de busqueda |
| get       | (name: string) => CookieDefinition &#124; null        | Función que retorna una cookie del navegador según su nombre   |
| getAll    | () => CookieDefinition[]                              | Función que retorna todas las cookies del navegador            |
| getValue  | (name: string) => string &#124; null                  | Función que devuelve el valor de una cookie                    |
| setValue  | (name: string, value: string, expires?: Date, path?: string, domain?: string, secure?: string) => void | Función que establece el valor de una cookie |

## Lista de Alias de las funciones disponibles fuera del objeto cookie

### NOTA

Los alias son utiles para exportar cada funcionalidad por separado sin necesidad de extraer cada una por separado del objeto `cookie`


| Nombre    | Alias            |
|-----------|------------------|
| contains  | containsCookie   |
| create    | createCookie     |
| delete    | deleteCookie     |
| deleteAll | deleteAllCookies |
| get       | getCookie        |
| getAll    | getAllCookies    |
| getValue  | getCookieValue   |
| setValue  | setCookieValue   |



## Propiedades CookieDefinition

| Nombre | Tipo    | Descripción               |
|--------|---------|---------------------------|
| name   | string  | Nombre la cookie          |
| value  | string  | Valor actual de la cookie |

## Modo de uso

### Utilizando el objeto cookie

```js
// Importaciones
import { cookie } from '@ayfdev/comunes'

cookie.create("COOKIE_NAME_1", "COOKIE_VALUE_1")
cookie.create("COOKIE_NAME_2", "COOKIE_VALUE_2")
cookie.create("COOKIE_NAME_3", "COOKIE_VALUE_3")

console.log(cookie.getAll())

// output:
[
    {
        name: "COOKIE_NAME_1",
        value: "COOKIE_VALUE_1"
    },
    {
        name: "COOKIE_NAME_2",
        value: "COOKIE_VALUE_2"
    },
    {
        name: "COOKIE_NAME_3",
        value: "COOKIE_VALUE_3"
    }
]
```

### Utilizando los alias

```js
// Importaciones
import { createCookie, getCookie } from '@ayfdev/comunes'

createCookie("COOKIE_NAME", "COOKIE_VALUE")
console.log(getCookie("COOKIE_NAME"))

// output:
{ name: 'COOKIE_NAME', value: 'COOKIE_VALUE' }
```

