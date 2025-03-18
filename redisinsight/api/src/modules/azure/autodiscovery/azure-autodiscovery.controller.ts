import { Controller, Get, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AzureAutodiscoveryService } from './azure-autodiscovery.service'
import { SubscriptionsDto } from './dto/subscriptions.dto'

@ApiTags('Azure')
@Controller('azure/autodiscovery')
export class AzureAutodiscoveryController {
  constructor(private readonly azureAutodiscoveryService: AzureAutodiscoveryService) {}

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get Azure subscriptions' })
  @ApiResponse({ status: 200, description: 'List of Azure subscriptions' })
  async getSubscriptions() {
    return this.azureAutodiscoveryService.getSubscriptions()
  }

  @Post('databases')
  @ApiOperation({ summary: 'Get Azure Redis databases for multiple subscriptions' })
  @ApiResponse({ status: 200, description: 'List of Azure Redis databases from multiple subscriptions' })
  async getDatabasesFromMultipleSubscriptions(@Body() subscriptionsDto: SubscriptionsDto) {
    return this.azureAutodiscoveryService.getDatabasesFromMultipleSubscriptions(subscriptionsDto.subscriptions);
  }
}