import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CaCertificateEntity } from 'src/modules/core/models/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/core/models/client-certificate.entity';
import { DatabaseInstanceEntity } from 'src/modules/core/models/database-instance.entity';
import { ServerEntity } from 'src/modules/core/models/server.entity';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { PluginStateEntity } from 'src/modules/workbench/entities/plugin-state.entity';
import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { DatabaseAnalysisEntity } from 'src/modules/database-analysis/entities/database-analysis.entity';
import { DataSource } from 'typeorm';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';
import migrations from '../migration';
import * as config from '../src/utils/config';

const dbConfig = config.get('db');

const ormConfig = {
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
    PluginStateEntity,
    NotificationEntity,
    DatabaseAnalysisEntity,
  ],
  migrations,
};

export const ormModuleOptions: TypeOrmModuleOptions = ormConfig as TypeOrmModuleOptions;
export default new DataSource({ ...ormConfig, type: 'sqlite' });
