import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AgreementsEntity } from 'src/modules/core/models/agreements.entity';
import { CaCertificateEntity } from 'src/modules/core/models/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/core/models/client-certificate.entity';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { ServerEntity } from 'src/modules/core/models/server.entity';
import { SettingsEntity } from 'src/modules/core/models/settings.entity';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import migrations from '../migration';
import * as config from '../src/utils/config';

const dbConfig = config.get('db');
const ormConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: dbConfig.database,
  synchronize: dbConfig.synchronize,
  migrationsRun: dbConfig.migrationsRun,
  entities: [
    AgreementsEntity,
    CaCertificateEntity,
    ClientCertificateEntity,
    DatabaseInstanceEntity,
    ServerEntity,
    SettingsEntity,
    CommandExecutionEntity,
  ],
  migrations,
  cli: {
    migrationsDir: 'migration',
  },
};

export default ormConfig;
