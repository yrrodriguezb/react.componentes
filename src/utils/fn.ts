export function isObject(obj: any) {
  if ( !obj || toString.call( obj ) !== "[object Object]" )
    return false;

  return true;
}

export function isNotObject(obj: any) {
  return !isObject(obj)
}

export function isEmptyObject(obj: any) {
  for (const _key in obj) {
    return false;
  }

  return true
};

export function isNotEmptyObject(obj: any) {
  return !isEmptyObject(obj)
}

export function isEmpty(value: any) {
  if (value === 'string') {
    return value.trim().length === 0;
  }

  return typeof value === 'undefined' || value === null;
}

export function isNotEmpty(value: any) {
  return !isEmpty(value);
}

export function isFunction(obj: any) {
  return typeof obj === "function" && obj instanceof Function;
};

export function isNotFunction(obj: any) {
  return !isFunction(obj);
};

export function isBoolean(obj: any) {
  return typeof obj === "boolean";
};

export function defaultFunction(..._args: any) { };

export function normalizeString(str: string | number) {
  return str
    .toString()
    .trim()
    .toLocaleLowerCase();
}


const utilsFunctions = {
  defaultFunction,
  isBoolean,
  isEmptyObject,
  isFunction,
  isNotFunction,
  isNotEmptyObject,
  isNotObject,
  isObject,
  normalizeString
}

export default utilsFunctions;
