import { Module } from '@nestjs/common';
import { CloudUserModule } from 'src/modules/cloud/user/cloud-user.module';
import { CloudDatabaseController } from 'src/modules/cloud/database/cloud-database.controller';
import { CloudDatabaseCapiProvider } from 'src/modules/cloud/database/cloud-database.capi.provider';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';

@Module({
  imports: [CloudUserModule],
  providers: [
    CloudDatabaseCapiProvider,
    CloudDatabaseCapiService,
  ],
  controllers: [CloudDatabaseController],
  exports: [CloudDatabaseCapiService],
})
export class CloudDatabaseModule {}
