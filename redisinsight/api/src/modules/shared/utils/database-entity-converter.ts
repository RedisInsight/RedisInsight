import { DatabaseInstanceResponse } from 'src/modules/instances/dto/database-instance.dto';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';

export const convertEntityToDto = (database: DatabaseInstanceEntity): DatabaseInstanceResponse => {
  if (database) {
    const {
      tls,
      tlsServername,
      verifyServerCert,
      caCert,
      clientCert,
      nodes,
      sentinelMasterName,
      sentinelMasterPassword,
      sentinelMasterUsername,
      modules,
      encryption,
      ...rest
    } = database;
    const result: DatabaseInstanceResponse = {
      modules: modules ? JSON.parse(modules) : [],
      ...rest,
    };
    if (nodes) {
      result.endpoints = JSON.parse(nodes);
    }
    if (sentinelMasterName) {
      result.sentinelMaster = {
        name: sentinelMasterName,
        password: sentinelMasterPassword,
        username: sentinelMasterUsername,
      };
    }
    if (tls) {
      result.tls = { verifyServerCert: verifyServerCert || false, servername: tlsServername };
      if (caCert) {
        result.tls.caCertId = caCert.id;
      }
      if (clientCert) {
        result.tls.clientCertPairId = clientCert.id;
      }
    }
    return result;
  }
  return null;
};
