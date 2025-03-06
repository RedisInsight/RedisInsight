import { Controller, Get, Param, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AzureAutodiscoveryService } from './azure-autodiscovery.service'

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
  async getDatabasesFromMultipleSubscriptions(@Body() body: { subscriptions: { id: string }[] }) {
    const { subscriptions } = body;

    if (!subscriptions || !Array.isArray(subscriptions)) {
      return [];
    }

    try {
      const databasePromises = subscriptions.map(subscription =>
        this.azureAutodiscoveryService.getDatabases(subscription.id)
          .then(databases => databases.map(db => ({
            ...db,
            subscriptionId: subscription.id
          })))
          .catch(error => {
            // Log the error but continue with other subscriptions
            this.azureAutodiscoveryService.logger.error(
              `Failed to fetch databases for subscription ${subscription.id}`,
              error
            );
            return [];
          })
      );

      const databasesArrays = await Promise.all(databasePromises);

      return databasesArrays.flat();
    } catch (error) {
      this.azureAutodiscoveryService.logger.error('Failed to fetch databases from multiple subscriptions', error);
      throw error;
    }
  }
}