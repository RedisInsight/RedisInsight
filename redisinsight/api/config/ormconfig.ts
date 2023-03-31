import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ServerEntity } from 'src/modules/server/entities/server.entity';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { PluginStateEntity } from 'src/modules/workbench/entities/plugin-state.entity';
import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { DatabaseAnalysisEntity } from 'src/modules/database-analysis/entities/database-analysis.entity';
import { DatabaseRecommendationEntity }
  from 'src/modules/database-recommendation/entities/database-recommendation.entity';
import { DataSource } from 'typeorm';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { SshOptionsEntity } from 'src/modules/ssh/entities/ssh-options.entity';
import { BrowserHistoryEntity } from 'src/modules/browser/entities/browser-history.entity';
import { CustomTutorialEntity } from 'src/modules/custom-tutorial/entities/custom-tutorial.entity';
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
    DatabaseEntity,
    ServerEntity,
    SettingsEntity,
    CommandExecutionEntity,
    PluginStateEntity,
    NotificationEntity,
    DatabaseAnalysisEntity,
    DatabaseRecommendationEntity,
    BrowserHistoryEntity,
    SshOptionsEntity,
    CustomTutorialEntity,
  ],
  migrations,
};

export const ormModuleOptions: TypeOrmModuleOptions = ormConfig as TypeOrmModuleOptions;
export default new DataSource({ ...ormConfig, type: 'sqlite' });
