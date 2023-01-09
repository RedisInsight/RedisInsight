export const ADD_NEW_CA_CERT = 'ADD_NEW_CA_CERT'
export const NO_CA_CERT = 'NO_CA_CERT'
export const ADD_NEW = 'ADD_NEW'

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
  sshPrivateKey: 'SSH Private Key'
}
