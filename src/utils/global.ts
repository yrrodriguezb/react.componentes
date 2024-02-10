import packageJson from '../../package.json';

export interface AYF {
  APP_NAME: string;
  APP_VERSION: string;
  BASE_URL: string,
  BUILD_MODE_PRODUCTION: boolean;
  SITE_URL: string;
  TOKEN: string;
  VERSION_ERP: string;
}


const tryGetVersionErp = () => {
  const regex = /v(\d)?/gi;
  const  pathname = window.parent.location.pathname || window.location.pathname;

  const arr = regex.exec(pathname)
  let version = ''

  if (arr?.length)
    version = arr[0];

  return version;
}

const tryGetURL = () => {
  const origin = window.location.origin;
  const regex = /sinco(\w+)?/gi;
  const arr = regex.exec(window.location.pathname)
  let site = ''

  if (arr?.length)
    site = arr[0];

  return `${origin}/${site}`;
}

const tryGetToken = (attemps: number = 3) => {
  let _attempts = attemps;
  let token = '';
  let parent: any = window.parent;

  while (token === '' && _attempts > 0) {
    if (parent?.getToken){
      token = parent.getToken();
    }

    parent = parent?.parent;
    _attempts -= 1;
  }

  return (token || '');
}

const resolveToken = () => {
  const win = (window as any);
  if (win.getToken)
    return win.getToken()

  return tryGetToken();
}

const resolveURL = (): string => {
  if (import.meta.env.PROD)
    return tryGetURL()

  return import.meta.env.VITE_HOST || ''
}

const resolveVersionErp = () => {
  return tryGetVersionErp();
}

const siteUrl = resolveURL();
const versionErp = resolveVersionErp();
const baseUrl = Boolean(siteUrl.length) && Boolean(versionErp.length) ? `${siteUrl}/${versionErp}` : '';

const __AYF: AYF = {
  APP_NAME: packageJson.name || 'configuracion',
  APP_VERSION: packageJson.version,
  BASE_URL: baseUrl,
  BUILD_MODE_PRODUCTION: import.meta.env.PROD,
  SITE_URL: siteUrl,
  TOKEN: resolveToken(),
  VERSION_ERP: versionErp
}

window.__AYF__ = window.__AYF__ || __AYF;

export default window.__AYF__;
