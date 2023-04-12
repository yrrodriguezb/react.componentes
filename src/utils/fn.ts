export function isObject(obj: any) {
  if ( !obj || toString.call( obj ) !== "[object Object]" )
    return false;

  return true;
}

export function isNotObject(obj: any) {
  return !isObject(obj)
}

export function isEmptyObject(obj: any) {
  for (const key in obj) {
    return false;
  }

  return true
};

export function isNotEmptyObject(obj: any) {
  return !isEmptyObject(obj)
}

export function isFunction(obj: any) {
  return typeof obj === "function" && obj instanceof Function;
};

export function isNotFunction(obj: any) {
  return !isFunction(obj);
};

export function defaultFunction(...args: any) { };

export function normalizeString(str: string | number) {
  return str
    .toString()
    .trim()
    .toLocaleLowerCase();
}


const utilsFunctions = {
  defaultFunction,
  isEmptyObject,
  isFunction,
  isNotFunction,
  isNotEmptyObject,
  isNotObject,
  isObject,
  normalizeString
}

export default utilsFunctions;
