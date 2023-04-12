export interface AYF {
  APP_NAME: string;
  APP_VERSION: string;
  BUILD_MODE_PRODUCTION: boolean;
  SITE_URL: string;
  TOKEN: string;
  VERSION_ERP: string;
}

declare global {
  const __AYF__: AYF
}

declare global {
  interface Window {
    __AYF__: AYF
  }
}

declare const __AYF__: AYF;
