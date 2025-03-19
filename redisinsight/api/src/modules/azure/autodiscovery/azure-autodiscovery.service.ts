import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { MicrosoftAuthService } from '../../auth/microsoft-auth/microsoft-azure-auth.service'
import { ApiAzureClient } from '../client/api.azure.client'
import { AzureClientMetadata, AzureRedisDatabase } from '../client/azure.interfaces'
import { SubscriptionDto } from './dto/subscriptions.dto'
import { AzureRedisDatabaseDto } from './dto/azure-redis-database.dto'

export interface EnhancedAzureRedisDatabase extends AzureRedisDatabase {
  subscriptionId: string
}

@Injectable()
export class AzureAutodiscoveryService {
  public readonly logger = new Logger(AzureAutodiscoveryService.name)
  private readonly azureClient: ApiAzureClient

  constructor(
    private readonly microsoftAuthService: MicrosoftAuthService,
  ) {
    const clientMetadata: AzureClientMetadata = {
      id: 'azure-client',
    }

    this.azureClient = new ApiAzureClient(clientMetadata)
  }

  private async ensureAuthenticated(): Promise<void> {
    const accessToken = await this.microsoftAuthService.getAccessToken()
    if (!accessToken) {
      throw new UnauthorizedException('No Azure access token available')
    }

    this.azureClient.setAuthToken(accessToken)
  }

  async getSubscriptions(): Promise<SubscriptionDto[]> {
    try {
      await this.ensureAuthenticated()
      const data = await this.azureClient.getSubscriptions()
      return data?.map(subscription => ({
        id: subscription.subscriptionId,
        name: subscription.displayName,
        isActive: subscription.state === 'Enabled'
      }))
    } catch (error) {
      this.logger.error('Failed to fetch Azure subscriptions', error)
      throw error
    }
  }

  async getDatabases(subscriptionId: string): Promise<AzureRedisDatabase[]> {
    try {
      await this.ensureAuthenticated()
      return this.azureClient.getDatabases(subscriptionId)
    } catch (error) {
      this.logger.error(`Failed to fetch Azure Redis databases for subscription ${subscriptionId}`, error)
      throw error
    }
  }

  async getDatabasesFromMultipleSubscriptions(subscriptions: Pick<SubscriptionDto, 'id'>[]): Promise<AzureRedisDatabaseDto[]> {
    if (!subscriptions || !Array.isArray(subscriptions)) {
      return []
    }

    try {
      await this.ensureAuthenticated()

      const databasesArrays = await this.azureClient.getDatabasesFromMultipleSubscriptions(subscriptions)

      const enhancedDatabasesPromises = databasesArrays.map(async (databases, subscriptionIndex) => {
        const enhancedDatabases = await Promise.all(
          databases.map(async (db) => {
            const keys = await this.azureClient.getDatabaseKeys(db.id)

            return {
              id: db.id,
              name: db.name,
              type: db.type,
              location: db.location,
              properties: {
                ...db.properties,
                connectionString: `${db.properties.hostName}:${db.properties.sslPort},password=${keys.primaryKey},ssl=True`,
                host: db.properties.hostName,
                port: db.properties.sslPort,
                password: keys.primaryKey,
                useSsl: true,
              },
              subscriptionId: subscriptions[subscriptionIndex].id
            }
          })
        )

        return enhancedDatabases
      })

      const allDatabases = await Promise.all(enhancedDatabasesPromises)
      return allDatabases.flat()
    } catch (error) {
      this.logger.error('Failed to fetch databases from multiple subscriptions', error)
      throw error
    }
  }
}