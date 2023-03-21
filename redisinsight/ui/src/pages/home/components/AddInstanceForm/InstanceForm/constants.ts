export const ADD_NEW_CA_CERT = 'ADD_NEW_CA_CERT'
export const NO_CA_CERT = 'NO_CA_CERT'
export const ADD_NEW = 'ADD_NEW'
export const NONE = 'NONE'

export enum SshPassType {
  Password = 'password',
  PrivateKey = 'privateKey'
}

export const fieldDisplayNames = {
  port: 'Port',
  host: 'Host',
  name: 'Database alias',
  selectedCaCertName: 'CA Certificate',
  newCaCertName: 'CA Certificate Name',
  newCaCert: 'CA certificate',
  newTlsCertPairName: 'Client Certificate Name',
  newTlsClientCert: 'Client Certificate',
  newTlsClientKey: 'Private Key',
  servername: 'Server Name',
  sentinelMasterName: 'Primary Group Name',
  sshHost: 'SSH Host',
  sshPort: 'SSH Port',
  sshPrivateKey: 'SSH Private Key',
  sshUsername: 'SSH Username',
}

const DEFAULT_TIMEOUT_ENV = process.env.CONNECTIONS_TIMEOUT_DEFAULT || '30000' // 30 sec

export const DEFAULT_TIMEOUT = parseInt(DEFAULT_TIMEOUT_ENV, 10)
