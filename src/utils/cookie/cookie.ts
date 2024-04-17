export interface CookieDefinition {
  name: string,
  value: string
}

export interface Cookie {
  contains: (pattern: RegExp) => CookieDefinition[];
  create: (name: string, value: string, path?: string) => void;
  delete: (name: string, path?: string) => void;
  deleteAll: (pattern: RegExp) => void;
  get: (name: string) => CookieDefinition | null;
  getAll: () => CookieDefinition[];
  getValue: (name: string) => string | null;
  setValue: (name: string, value: string, expires?: Date, path?: string, domain?: string, secure?: string) => void;
}

const _getAllCookies = (pattern?: RegExp) => {
  const allCookies = document.cookie;

  let cookieArray = allCookies.split('; ');

  if (pattern) {
     cookieArray = cookieArray.filter(cookie => pattern.test(cookie));
  }

  const cookieNames = cookieArray.map(cookie => {
    const [ name, value ] = cookie.split('=');
    return { name, value } as CookieDefinition;
  });

  return cookieNames || [];
}

const _getCookie = (name: string) => {
  const cookieArray = _getAllCookies(new RegExp(name));

  if (cookieArray.length) {
    return cookieArray.find(cookie => cookie.name === name) || null;
  }

  return null;
}

const _deleteCookie = (name: string, path?: string) => {
  const _path = path || '/';
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${_path};`;
}

const _deleteAllCookies = (pattern: RegExp) => {
  const cookieArray = _getAllCookies(pattern);

  cookieArray.forEach((cookie: CookieDefinition) => {
    _deleteCookie(cookie.name);
  })
}

const _contains = (pattern: RegExp) => {
  return _getAllCookies(pattern);
}

// Función para obtener el valor de una cookie por su nombre
export function getCookieValue(cookieName: string) {
  const cookieArray = document.cookie.split('; ');
  for (const cookie of cookieArray) {
    const [name, value] = cookie.split('=');
    if (name === cookieName) {
      return value;
    }
  }

  return null; // Si no se encuentra la cookie
}

// Función para eliminar una cookie por su nombre
export function deleteCookie(name: string, path?: string) {
  _deleteCookie(name, path);
}

export function deleteAllCookies(pattern: RegExp) {
  _deleteAllCookies(pattern);
}

// Función para establecer el valor de una cookie por su nombre
export function setCookieValue(name: string, value: string, expires?: Date, path?: string, domain?: string, secure?: string) {
  document.cookie = name + "=" + value +
  ((expires == null) ? "" : "; expires=" + expires.toUTCString()) +
  ((path == null) ? "" : "; path=" + path) +
  ((domain == null) ? "" : "; domain=" + domain) +
  ((secure == null) ? "" : "; secure");
}

// Función para crear una cookie
export function createCookie(name: string, value: string, path?: string) {
  const _path = path || '';
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Caduca en 1 año

  document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=${_path || ''};`;
}

export function getCookie(name: string) {
  return _getCookie(name);
}

// Función para obtener todas las cookies segun el patron de la expresion regular
export function getAllCookies() {
  return _getAllCookies();
}

export function containsCookie(pattern: RegExp) {
  return _contains(pattern);
}

const cookie: Cookie = {
  create: createCookie,
  contains: containsCookie,
  delete: deleteCookie,
  deleteAll: deleteAllCookies,
  get: getCookie,
  getAll: getAllCookies,
  getValue: getCookieValue,
  setValue: setCookieValue
}

export default cookie;
