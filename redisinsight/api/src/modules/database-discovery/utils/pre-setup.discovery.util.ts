import { pathExists, readFile } from 'fs-extra';
import { Database } from 'src/modules/database/models/database';
import {
  Compressor,
  ConnectionType,
} from 'src/modules/database/entities/database.entity';
import { Logger } from '@nestjs/common';
import { Validator } from 'class-validator';
import { plainToClass } from 'class-transformer';

const logger = new Logger('LocalPreSetupDatabaseDiscoveryService');

const validator = new Validator();

export const scanProcessEnv = (): string[] => {
  const hostEnvs = [];

  Object.entries(process.env).forEach(([env]) => {
    if (env.startsWith('RI_REDIS_HOST')) {
      hostEnvs.push(env);
    }
  });

  return hostEnvs;
};

/**
 * Explicitly set not defined data to default to be overwritten in database
 * @param database
 */
export const populateDefaultValues = (database: Database): Database => {
  const {
    host,
    port = 6379,
    name = null,
    db = null,
    provider = null,
    modules = [],
    verifyServerCert = null,
    ssh = null,
    sshOptions = null,
    tlsServername = null,
    caCert = null,
    clientCert = null,
    nameFromProvider = null,
    username = null,
    password = null,
    compressor = Compressor.NONE,
    connectionType = ConnectionType.NOT_CONNECTED,
  } = database;

  return {
    ...database,
    port,
    db,
    provider,
    modules,
    verifyServerCert,
    ssh,
    sshOptions,
    tlsServername,
    caCert,
    clientCert,
    nameFromProvider,
    username,
    password,
    compressor,
    name: name || `${host}:${port}`,
    connectionType,
    isPreSetup: true,
  };
};

export const getCertificateData = async (
  envPrefix: string,
  id: string,
): Promise<string | null> => {
  try {
    const base64 = process.env[`${envPrefix}_BASE64${id}`] || '';

    if (base64) {
      return Buffer.from(base64, 'base64').toString();
    }

    const path = process.env[`${envPrefix}_PATH${id}`] || '';

    if (path) {
      return (await readFile(path, 'utf8')).toString();
    }
  } catch (error) {
    // ignore error
    logger.warn('Unable to get pre setup certificate data', error, {
      envPrefix,
      id,
    });
  }

  return null;
};

export const prepareDatabaseFromEnvs = async (
  hostEnv: string,
): Promise<Database> => {
  try {
    const id = hostEnv.replace(/^RI_REDIS_HOST/, '');

    const databaseToAdd: Database = populateDefaultValues({
      id: id || '0',
      host: process.env[hostEnv],
      port: parseInt(process.env[`RI_REDIS_PORT${id}`], 10) || 6379,
      name: process.env[`RI_REDIS_NAME${id}`],
      username: process.env[`RI_REDIS_USERNAME${id}`],
      password: process.env[`RI_REDIS_PASSWORD${id}`],
      connectionType: ConnectionType.NOT_CONNECTED,
      tls: process.env[`RI_REDIS_TLS${id}`] === 'true',
      compressor: process.env[`RI_REDIS_COMPRESSOR${id}`] as Compressor,
    });

    // CA certificate
    const tlsCA = await getCertificateData('RI_REDIS_TLS_CA', id);

    if (tlsCA) {
      databaseToAdd.caCert = {
        id,
        name: `${id}_${databaseToAdd.name}`,
        certificate: tlsCA,
        isPreSetup: true,
      };
    }

    // User certificate
    const tlsCertificate = await getCertificateData('RI_REDIS_TLS_CERT', id);
    const tlsKey = await getCertificateData('RI_REDIS_TLS_KEY', id);

    if (tlsCertificate && tlsKey) {
      databaseToAdd.clientCert = {
        id,
        name: `${id}_${databaseToAdd.name}`,
        certificate: tlsCertificate,
        key: tlsKey,
        isPreSetup: true,
      };
      databaseToAdd.verifyServerCert = true;
    }

    await validator.validateOrReject(
      plainToClass(Database, databaseToAdd, { groups: ['security'] }),
    );

    return databaseToAdd;
  } catch (error) {
    // ignore error
    logger.warn('Unable to prepare pre setup database from env', error, {
      hostEnv,
    });
    return null;
  }
};

export const discoverEnvDatabasesToAdd = async (): Promise<Database[]> => {
  try {
    const hostEnvs = scanProcessEnv();

    return (await Promise.all(hostEnvs.map(prepareDatabaseFromEnvs))).filter(
      (v) => !!v,
    );
  } catch (e) {
    // ignore error
    return [];
  }
};

export const prepareDatabaseFromFile = async (
  database: Database,
): Promise<{}> => {
  try {
    const databaseToAdd = populateDefaultValues(database);

    await validator.validateOrReject(
      plainToClass(Database, databaseToAdd, { groups: ['security'] }),
    );
    return databaseToAdd;
  } catch (error) {
    // ignore error
    logger.warn('Unable to prepare pre setup database from file', error, {
      databaseId: database?.['id'],
    });
    return null;
  }
};

export const discoverFileDatabasesToAdd = async (
  path: string,
): Promise<Database[]> => {
  try {
    if (await pathExists(path)) {
      const fileData = JSON.parse((await readFile(path, 'utf8')).toString());

      return (await Promise.all(fileData.map(prepareDatabaseFromFile))).filter(
        (v) => !!v,
      );
    }
  } catch (error) {
    // ignore error
    logger.warn('Unable to discover pre setup databases from file', error);
  }

  return [];
};
