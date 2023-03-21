import { Instance } from 'uiSrc/slices/interfaces'
import { ADD_NEW_CA_CERT, NO_CA_CERT } from './constants'

export interface DbConnectionInfo extends Instance {
  port: string
  tlsClientAuthRequired?: boolean
  certificates?: { id: number; name: string }[]
  selectedTlsClientCertId?: string | 'ADD_NEW' | undefined
  newTlsCertPairName?: string
  newTlsClientCert?: string
  newTlsClientKey?: string
  servername?: string
  verifyServerTlsCert?: boolean
  caCertificates?: { name: string; id: string }[]
  selectedCaCertName: string | typeof ADD_NEW_CA_CERT | typeof NO_CA_CERT
  newCaCertName?: string
  newCaCert?: string
  username?: string
  password?: string
  timeout?: string
  showDb?: boolean
  showCompressor?: boolean
  sni?: boolean
  sentinelMasterUsername?: string
  sentinelMasterPassword?: string
  sentinelMasterName?: string
  ssh?: boolean
  sshPassType?: string
  sshHost: string
  sshPort: string
  sshUsername?: string
  sshPassword?: string
  sshPrivateKey?: string
  sshPassphrase?: string
}

export interface ISubmitButton {
  onClick: () => void
  text?: string
  submitIsDisabled?: boolean
}
