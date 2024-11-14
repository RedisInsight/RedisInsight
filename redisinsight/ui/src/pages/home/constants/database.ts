export enum AddDbType {
  manual,
  auto,
  cloud,
  import
}

export enum CloudConnectionOptions {
  Account = 'cloud-account',
  ApiKeys = 'cloud-api-keys'
}

export const CREATE_CLOUD_DB_ID = 'create-free-cloud-db'
