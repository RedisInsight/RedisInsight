import { Controller, Get, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AzureAutodiscoveryService, EnhancedAzureRedisDatabase } from './azure-autodiscovery.service'
import { SubscriptionsDto, SubscriptionDto } from './dto/subscriptions.dto'
import { AzureRedisDatabaseDto } from './dto/azure-redis-database.dto'

@ApiTags('Azure')
@Controller('azure/autodiscovery')
export class AzureAutodiscoveryController {
  constructor(private readonly azureAutodiscoveryService: AzureAutodiscoveryService) {}

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get Azure subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'List of Azure subscriptions',
    type: [SubscriptionDto]
  })
  async getSubscriptions(): Promise<SubscriptionDto[]> {
    return this.azureAutodiscoveryService.getSubscriptions()
  }

  @Post('databases')
  @ApiOperation({ summary: 'Get Azure Redis databases for multiple subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'List of Azure Redis databases from multiple subscriptions',
    type: [AzureRedisDatabaseDto]
  })
  async getDatabasesFromMultipleSubscriptions(
    @Body() subscriptionsDto: SubscriptionsDto
  ): Promise<EnhancedAzureRedisDatabase[]> {
    return this.azureAutodiscoveryService.getDatabasesFromMultipleSubscriptions(subscriptionsDto.subscriptions)
  }
}