import type { Config } from 'jest';

const config:Config = {
  verbose: true,
  transform: {
    "\\.tsx?$": [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta',
              options: {
                metaObjectReplacement: {
                  env: {
                    DEV: true,
                    PROD: false,
                    VITE_URL_API_ACTIVOSFIJOS: '',
                    VITE_URL_API_CONFIGURACION: '',
                    VITE_URL_API_CONTABILIDAD: '',
                    VITE_URL_API_CUENTAS_POR_PAGAR: '',
                    VITE_URL_API_OBLIGACIONES_FINANCIERAS: '',
                    VITE_URL_API_TESORERIA: '',
                    VITE_HOST: ''
                  },
                },
              },
            },
          ],
        },
      },
    ],
    "\\.jsx?$": "babel-jest",

  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  moduleNameMapper: {
    "^.+\\.svg$": "jest-svg-transformer",
  }
};

export default config;
