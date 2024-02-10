export const regexNumber = /[+-]?(\d*\.)?\d+/gim;

export const regexURL = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export const regexEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export const regexDateDMY = /\d{1,2}\/\d{1,2}\/\d{2,4}/;

const all = {
  regexNumber,
  regexDateDMY,
  regexEmail,
  regexURL
}

export default all;
