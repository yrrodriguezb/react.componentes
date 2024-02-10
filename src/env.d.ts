// /// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_API_ACTIVOSFIJOS: string;
  readonly VITE_URL_API_CONFIGURACION: string;
  readonly VITE_URL_API_CONTABILIDAD: string;
  readonly VITE_URL_API_CUENTAS_POR_PAGAR: string;
  readonly VITE_URL_API_OBLIGACIONES_FINANCIERAS: string;
  readonly VITE_URL_API_TESORERIA: string;
  readonly VITE_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
