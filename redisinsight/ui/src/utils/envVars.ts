import { Maybe } from './types'

export interface EnvVars {
  NODE_ENV: Maybe<string>
  PORT: Maybe<string>
  APP_ENV: Maybe<string>
  API_PREFIX: Maybe<string>
  API_PORT: Maybe<string>
  BASE_API_URL: Maybe<string>
  RESOURCES_BASE_URL: Maybe<string>
  PIPELINE_COUNT_DEFAULT: Maybe<string>
  SCAN_COUNT_DEFAULT: Maybe<string>
  SCAN_TREE_COUNT_DEFAULT: Maybe<string>
  SEGMENT_WRITE_KEY: Maybe<string>
  CONNECTIONS_TIMEOUT_DEFAULT: Maybe<string>
}

export const envVars = window.envVariables?.APP_ENV === 'web' ? process.env : window.envVariables
