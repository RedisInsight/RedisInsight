import { Module } from '@nestjs/common';
import { CloudDatabaseCapiProvider } from 'src/modules/cloud/database/cloud-database.capi.provider';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';

@Module({
  providers: [
    CloudDatabaseCapiProvider,
    CloudDatabaseCapiService,
  ],
  controllers: [],
  exports: [CloudDatabaseCapiService],
})
export class CloudDatabaseModule {}
