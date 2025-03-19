import { Module } from '@nestjs/common'
import { AzureAutodiscoveryController } from './autodiscovery/azure-autodiscovery.controller'
import { AzureAutodiscoveryService } from './autodiscovery/azure-autodiscovery.service'
import { MicrosoftAuthModule } from '../auth/microsoft-auth/microsoft-azure-auth.module'

@Module({
  imports: [
    MicrosoftAuthModule,
  ],
  controllers: [AzureAutodiscoveryController],
  providers: [AzureAutodiscoveryService],
})
export class AzureModule {}