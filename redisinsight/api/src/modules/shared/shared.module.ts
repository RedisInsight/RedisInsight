import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'src/utils/config';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';
import { StackDatabasesProvider } from 'src/modules/shared/services/instances-business/stack.databases.provider';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

const SERVER_CONFIG = config.get('server');

@Module({
  imports: [
    TypeOrmModule.forFeature([DatabaseEntity]),
  ],
  providers: [
    {
      provide: DatabasesProvider,
      useClass: SERVER_CONFIG.buildType === 'REDIS_STACK' ? StackDatabasesProvider : DatabasesProvider,
    },
  ],
  exports: [],
})
export class SharedModule {}
