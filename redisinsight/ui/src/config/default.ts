const intEnv = (envName: string, defaultValue: number): number => {
  const value = parseInt(process?.env?.[envName] || '', 10)

  return Number.isNaN(value) ? defaultValue : value
}

const booleanEnv = (envName: string, defaultValue: boolean): boolean => {
  const value = process?.env?.[envName]

  if (value === undefined) {
    return defaultValue
  }

  return ['true', '1'].includes(value || '')
}

const apiUrl = process.env.RI_SERVER_TLS_CERT && process.env.RI_SERVER_TLS_KEY
  ? 'https://localhost'
  : 'http://localhost'

export const defaultConfig = {
  api: {
    prefix: process.env.RI_API_PREFIX ?? 'api',
    port: intEnv('RI_APP_PORT', 5540),
    baseUrl: process.env.RI_BASE_API_URL ?? apiUrl,
    hostedBaseUrl: process.env.RI_HOSTED_API_BASE_URL ?? '',
    hostedBase: process.env.RI_HOSTED_BASE ?? '',
    csrfEndpoint: process.env.RI_CSRF_ENDPOINT ?? '',
    socketTransports: process.env.RI_SOCKET_TRANSPORTS,
    socketCredentials: booleanEnv('RI_SOCKET_CREDENTIALS', false),
    hostedSocketProxyPath: process.env.RI_HOSTED_SOCKET_PROXY_PATH,
  },
  database: {
    defaultConnectionTimeout: intEnv('RI_CONNECTIONS_TIMEOUT_DEFAULT', 30_000),
  },
  app: {
    env: process.env.NODE_ENV,
    type: process.env.RI_APP_TYPE,
    resourcesBaseUrl: process.env.RI_RESOURCES_BASE_URL ?? apiUrl, // todo: no usage found
    unauthenticatedRedirect: process.env.RI_401_REDIRECT_URL ?? '',
    defaultTheme: process.env.RI_DEFAULT_THEME ?? 'DARK',
    lazyLoad: booleanEnv('RI_ROUTES_LAZY_LOAD', false),
    routesExcludedByEnv: booleanEnv('RI_ROUTES_EXCLUDED_BY_ENV', false),
  },
  workbench: {
    pipelineCountDefault: intEnv('PIPELINE_COUNT_DEFAULT', 5),
  },
  browser: {
    scanCountDefault: intEnv('RI_SCAN_COUNT_DEFAULT', 500),
    scanTreeCountDefault: intEnv('RI_SCAN_TREE_COUNT_DEFAULT', 10_000),
  },
  features: {
    envDependent: {
      defaultFlag: booleanEnv('RI_FEATURES_ENV_DEPENDENT_DEFAULT_FLAG', true)
    }
  }
}

export type Config = typeof defaultConfig

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T
export type PartialConfig = DeepPartial<Config>
