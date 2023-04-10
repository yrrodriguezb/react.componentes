import axios, { CreateAxiosDefaults } from "axios";
import '../utils/global'

let headers: any = {};
let baseURL: string = '';

// if (__AYF__.SITE_URL)
//   baseURL += __AYF__.SITE_URL

// if (__AYF__.VERSION_ERP)
//   baseURL = `${baseURL}/${__AYF__.VERSION_ERP}`

// if (__AYF__.TOKEN)
//   headers.Authorization =  __AYF__.TOKEN

let configAxios: CreateAxiosDefaults = {
  baseURL,
  headers
};

const api = axios.create(configAxios);

export default api;
