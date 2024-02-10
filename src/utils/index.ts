import AYF_VARIABLES from './global';

import  {
  functions,
  letters,
  numbers,
  numpad,
  others,
  symbols
}  from './keyboard';

export const keyboard = {
  functions,
  letters,
  numbers,
  numpad,
  others,
  symbols
};

export const AYF_GLOBAL = AYF_VARIABLES;

export {
  defaultFunction,
  isBoolean,
  isEmptyObject,
  isFunction,
  isNotEmptyObject,
  isNotFunction,
  isNotObject,
  isObject,
  normalizeString
} from './fn';

export {
  range
} from './array'

export * from './global';

export {
  getRandomInt,
  unique
} from './random';

export * from './constantes';
export * from './regex';