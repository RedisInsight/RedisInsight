import { ConnectionType } from "src/modules/database/entities/database.entity";

export const fieldsMapSchema: Array<[string, string[]]> = [
  ['name', ['name', 'connectionName']],
  ['username', ['username']],
  ['password', ['password', 'auth']],
  ['host', ['host']],
  ['port', ['port']],
  ['db', ['db']],
  ['provider', ['provider']],
  ['isCluster', ['cluster']],
  ['type', ['type']],
  ['connectionType', ['connectionType']],
  ['tls', ['tls', 'ssl']],
  ['tlsServername', ['tlsServername']],
  ['tlsCaName', ['caCert.name']],
  ['tlsCaCert', ['caCert.certificate', 'caCert', 'sslOptions.ca', 'ssl_ca_cert_path']],
  ['tlsClientName', ['clientCert.name']],
  ['tlsClientCert', ['clientCert.certificate', 'certificate', 'sslOptions.cert', 'ssl_local_cert_path']],
  ['tlsClientKey', ['clientCert.key', 'keyFile', 'sslOptions.key', 'ssl_private_key_path']],
  ['sentinelMasterName', ['sentinelMaster.name', 'sentinelOptions.masterName', 'sentinelOptions.name']],
  ['sentinelMasterUsername', ['sentinelMaster.username']],
  ['sentinelMasterPassword', [
    'sentinelMaster.password', 'sentinelOptions.nodePassword', 'sentinelOptions.sentinelPassword',
  ]],
  ['sshHost', ['sshOptions.host', 'ssh_host', 'sshHost']],
  ['sshPort', ['sshOptions.port', 'ssh_port', 'sshPort']],
  ['sshUsername', ['sshOptions.username', 'ssh_user', 'sshUser']],
  ['sshPassword', ['sshOptions.password', 'ssh_password', 'sshPassword']],
  ['sshPrivateKey', ['sshOptions.privateKey', 'sshOptions.privatekey', 'ssh_private_key_path', 'sshKeyFile']],
  ['sshPassphrase', ['sshOptions.passphrase', 'sshKeyPassphrase']],
  ['sshAgentPath', ['ssh_agent_path']],
  ['compressor', ['compressor']],
  ['modules', ['modules']],
];

/**
 * Try to determine connection type based on input data
 * Should return NOT_CONNECTED when it is not possible
 * @param data
 */
export function determineConnectionType(data: any = {}): ConnectionType {
  if (data?.connectionType) {
    return (data.connectionType in ConnectionType)
      ? ConnectionType[data.connectionType]
      : ConnectionType.NOT_CONNECTED;
  }

  if (data?.type) {
    switch (data.type) {
      case 'cluster':
        return ConnectionType.CLUSTER;
      case 'sentinel':
        return ConnectionType.SENTINEL;
      case 'standalone':
        return ConnectionType.STANDALONE;
      default:
        return ConnectionType.NOT_CONNECTED;
    }
  }

  if (data?.isCluster === true) {
    return ConnectionType.CLUSTER;
  }

  if (data?.sentinelMasterName) {
    return ConnectionType.SENTINEL;
  }

  return ConnectionType.NOT_CONNECTED;
}

