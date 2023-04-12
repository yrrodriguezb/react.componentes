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
  isEmptyObject,
  isFunction,
  isNotEmptyObject,
  isNotFunction,
  isNotObject,
  isObject,
  normalizeString
} from './fn';

export {
  AYF
} from './global';

export {
  getRandomInt,
  unique
} from './random';
