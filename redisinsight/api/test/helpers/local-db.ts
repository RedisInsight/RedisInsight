import { Connection, createConnection, getConnectionManager } from 'typeorm';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { SettingsEntity } from 'src/modules/core/models/settings.entity';
import { AgreementsEntity } from 'src/modules/core/models/agreements.entity';
import { constants } from './constants';
import { createCipheriv, createHash } from 'crypto';

const repositories = {
  INSTANCE: 'DatabaseInstanceEntity',
  CA_CERT_REPOSITORY: 'CaCertificateEntity',
  CLIENT_CERT_REPOSITORY: 'ClientCertificateEntity',
  AGREEMENTS: 'AgreementsEntity',
  SETTINGS: 'SettingsEntity'
}

let localDbConnection;
const getDBConnection = async (): Promise<Connection> => {
  if (!localDbConnection) {
    const dbFile = constants.TEST_LOCAL_DB_FILE_PATH;
    localDbConnection = await createConnection({
      name: 'integrationtests',
      type: "sqlite",
      database: dbFile,
      entities: [`./../**/*.entity.ts`],
      synchronize: false,
      migrationsRun: false,
    })
      .catch(err => {
        if (err.name === "AlreadyHasActiveConnectionError") {
          return getConnectionManager().get("default");
        }
        throw err;
      });
  }

  return localDbConnection;
}

const getRepository = async (repository: string) => {
  return (await getDBConnection()).getRepository(repository);
};

const encryptData = (data) => {
  if (!data) {
    return null;
  }

  if (constants.TEST_ENCRYPTION_STRATEGY === 'KEYTAR') {
    let cipherKey = createHash('sha256')
      .update(constants.TEST_KEYTAR_PASSWORD, 'utf8')
      .digest();
    const cipher = createCipheriv('aes-256-cbc', cipherKey, Buffer.alloc(16, 0));
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  return data;
}

const createCACertificate = async (certificate) => {
  const rep = await getRepository(repositories.CA_CERT_REPOSITORY);
  return rep.save(certificate);
}

const createClientCertificate = async (certificate) => {
  const rep = await getRepository(repositories.CLIENT_CERT_REPOSITORY);
  return rep.save(certificate);
}

const createTesDbInstance = async (rte, server): Promise<void> => {
  const rep = await getRepository(repositories.INSTANCE);

  const instance: any = {
    id: constants.TEST_INSTANCE_ID,
    name: constants.TEST_INSTANCE_NAME,
    host: constants.TEST_REDIS_HOST,
    port: constants.TEST_REDIS_PORT,
    username: constants.TEST_REDIS_USER,
    password: encryptData(constants.TEST_REDIS_PASSWORD),
    encryption: constants.TEST_ENCRYPTION_STRATEGY,
    tls: false,
    verifyServerCert: false,
    connectionType: rte.env.type,
  };

  if (rte.env.type === constants.CLUSTER) {
    instance.nodes = JSON.stringify(rte.env.nodes);
  }

  if (rte.env.type === constants.SENTINEL) {
    instance.nodes = JSON.stringify([{
      host: constants.TEST_REDIS_HOST,
      port: constants.TEST_REDIS_PORT,
    }]);
    instance.sentinelMasterName = constants.TEST_SENTINEL_MASTER_GROUP;
    instance.sentinelMasterUsername = constants.TEST_SENTINEL_MASTER_USER;
    instance.sentinelMasterPassword = encryptData(constants.TEST_SENTINEL_MASTER_PASS);
  }

  if (constants.TEST_REDIS_TLS_CA) {
    instance.tls = true;
    instance.verifyServerCert = true;
    instance.caCert = await createCACertificate({
      id: constants.TEST_CA_ID,
      name: constants.TEST_CA_NAME,
      encryption: constants.TEST_ENCRYPTION_STRATEGY,
      certificate: encryptData(constants.TEST_REDIS_TLS_CA),
    });

    if (constants.TEST_USER_TLS_CERT && constants.TEST_USER_TLS_CERT) {
      instance.clientCert = await createClientCertificate({
        id: constants.TEST_USER_CERT_ID,
        name: constants.TEST_USER_CERT_NAME,
        encryption: constants.TEST_ENCRYPTION_STRATEGY,
        certificate: encryptData(constants.TEST_USER_TLS_CERT),
        key: encryptData(constants.TEST_USER_TLS_KEY),
      });
    }
  }

  await rep.save(instance);
}

export const createDatabaseInstances = async () => {
  const rep = await getRepository(repositories.INSTANCE);
  const instances = [
    {
      id: constants.TEST_INSTANCE_ID_2,
      name: constants.TEST_INSTANCE_NAME_2,
      host: constants.TEST_INSTANCE_HOST_2,
      db: constants.TEST_REDIS_DB_INDEX,
    },
    {
      id: constants.TEST_INSTANCE_ID_3,
      name: constants.TEST_INSTANCE_NAME_3,
      host: constants.TEST_INSTANCE_HOST_3,
    }
  ];

  for (let instance of instances) {
    // await rep.remove(instance);
    await rep.save({
      tls: false,
      verifyServerCert: false,
      host: 'localhost',
      port: 3679,
      connectionType: 'STANDALONE',
      ...instance
    });
  }
}

export const createAclInstance = async (rte, server): Promise<void> => {
  const rep = await getRepository(repositories.INSTANCE);
  const instance: any = {
    id: constants.TEST_INSTANCE_ACL_ID,
    name: constants.TEST_INSTANCE_ACL_NAME,
    host: constants.TEST_REDIS_HOST,
    port: constants.TEST_REDIS_PORT,
    username: constants.TEST_INSTANCE_ACL_USER,
    password: encryptData(constants.TEST_INSTANCE_ACL_PASS),
    encryption: constants.TEST_ENCRYPTION_STRATEGY,
    tls: false,
    verifyServerCert: false,
    connectionType: rte.env.type,
  }

  if (rte.env.type === constants.CLUSTER) {
    instance.nodes = JSON.stringify(rte.env.nodes);
  }

  if (rte.env.type === constants.SENTINEL) {
    instance.nodes = JSON.stringify([{
      host: constants.TEST_REDIS_HOST,
      port: constants.TEST_REDIS_PORT,
    }]);
    instance.username = constants.TEST_REDIS_USER;
    instance.password =  constants.TEST_REDIS_PASSWORD;
    instance.sentinelMasterName = constants.TEST_SENTINEL_MASTER_GROUP;
    instance.sentinelMasterUsername = constants.TEST_INSTANCE_ACL_USER;
    instance.sentinelMasterPassword = encryptData(constants.TEST_INSTANCE_ACL_PASS);
  }

  if (constants.TEST_REDIS_TLS_CA) {
    instance.tls = true;
    instance.verifyServerCert = true;
    instance.caCert = await createCACertificate({
      id: constants.TEST_CA_ID,
      name: constants.TEST_CA_NAME,
      encryption: constants.TEST_ENCRYPTION_STRATEGY,
      certificate: encryptData(constants.TEST_REDIS_TLS_CA),
    });

    if (constants.TEST_USER_TLS_CERT && constants.TEST_USER_TLS_CERT) {
      instance.clientCert = await createClientCertificate({
        id: constants.TEST_USER_CERT_ID,
        name: constants.TEST_USER_CERT_NAME,
        certFilename: constants.TEST_USER_CERT_FILENAME,
        encryption: constants.TEST_ENCRYPTION_STRATEGY,
        certificate: encryptData(constants.TEST_USER_TLS_CERT),
        key: encryptData(constants.TEST_USER_TLS_KEY),
      });
    }
  }

  await rep.save(instance);
}

export const getInstanceByName = async (name: string) => {
  const rep = await getRepository(repositories.INSTANCE);
  return rep.findOne({ where: { name } });
}

export const getInstanceById = async (id: string) => {
  const rep = await getRepository(repositories.INSTANCE);
  return rep.findOne({ where: { id } });
}

export const applyEulaAgreement = async () => {
  const rep = await getRepository(repositories.AGREEMENTS);
  const agreements: any = await rep.findOne();
  agreements.version = '1.0.0';
  agreements.data = JSON.stringify({eula: true, encryption: true});

  await rep.save(agreements);
}

const resetAgreements = async () => {
  const rep = await getRepository(repositories.AGREEMENTS);
  const agreements: any = await rep.findOne();
  agreements.version = null;
  agreements.data = null;

  await rep.save(agreements);
}

const initAgreements = async () => {
  const rep = await getRepository(repositories.AGREEMENTS);
  const agreements: any = await rep.findOne();
  agreements.version = constants.TEST_AGREEMENTS_VERSION;
  agreements.data = JSON.stringify({
    eula: true,
    encryption: constants.TEST_ENCRYPTION_STRATEGY === 'KEYTAR',
  });

  await rep.save(agreements);
}

export const resetSettings = async () => {
  await resetAgreements();
  const rep = await getRepository(repositories.SETTINGS);
  const settings: any = await rep.findOne();
  settings.data = null;

  await rep.save(settings);
}

export const initSettings = async () => {
  await initAgreements();
  const rep = await getRepository(repositories.SETTINGS);
  const settings: any = await rep.findOne();
  settings.data = null;

  await rep.save(settings);
}

export const setAppSettings = async (data: object) => {
  const rep = await getRepository(repositories.SETTINGS);
  const settings: any = await rep.findOne();
  settings.data = JSON.stringify({
    ...JSON.parse(settings.data),
    ...data
  });
  await rep.save(settings);
}

const truncateAll = async () => {
  await (await getRepository(repositories.INSTANCE)).clear();
  await (await getRepository(repositories.CA_CERT_REPOSITORY)).clear();
  await (await getRepository(repositories.CLIENT_CERT_REPOSITORY)).clear();
  await (await resetSettings());
}

export const initLocalDb = async (rte, server) => {
  await truncateAll();
  await createTesDbInstance(rte, server);
  await initAgreements();
  if (rte.env.acl) {
    await createAclInstance(rte, server);
  }
}
