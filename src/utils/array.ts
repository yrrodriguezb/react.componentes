export const  range = (start: number, stop?: number, step: number = 1) => {
  if (typeof stop === 'undefined') {
      stop = start;
      start = 0;
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return [];
  }

  let result = [];
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i);
  }

  return result;
};

const all = {
  range
}


export default all;
