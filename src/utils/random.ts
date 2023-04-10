const date = new Date();

const components_date = [
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
  date.getHours(),
  date.getMinutes(),
  date.getSeconds(),
  date.getMilliseconds()
];

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}


/**
 * Genera un número aleatorio teniendo en cuenta los segundos transcurridos de la fecha actual.
 *
 * @param {string} [sep] - sep Seprador entre datos de la fecha y el número aleatorio, @default ""
 * @return {string} str - string único con random (número entre 1 y 10000000).
 */
export function unique(sep: string = ''): string {
  return components_date.join("") + sep + getRandomInt(1, 10000000).toString();
}
