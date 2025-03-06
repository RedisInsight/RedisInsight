import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import axios from 'axios'
import { MicrosoftAuthService } from '../../auth/microsoft-auth/microsoft-azure-auth.service'

@Injectable()
export class AzureAutodiscoveryService {
  public readonly logger = new Logger(AzureAutodiscoveryService.name)

  constructor(
    private readonly microsoftAuthService: MicrosoftAuthService,
  ) {}

  async getSubscriptions() {
    try {
      const accessToken = await this.microsoftAuthService.getAccessToken()
      if (!accessToken) {
        throw new UnauthorizedException('No Azure access token available')
      }

      const response = await axios.get(
        'https://management.azure.com/subscriptions?api-version=2024-08-01',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      return response.data.value.map((sub: any) => ({
        id: sub.subscriptionId,
        name: sub.displayName,
        state: sub.state,
        tenantId: sub.tenantId,
        isActive: sub.state === 'Enabled',
      }))
    } catch (error) {
      this.logger.error('Failed to fetch Azure subscriptions', error)
      throw error
    }
  }

  async getDatabases(subscriptionId: string) {
    try {
      const accessToken = await this.microsoftAuthService.getAccessToken()

      if (!accessToken) {
        throw new UnauthorizedException('No Azure access token available')
      }

      const response = await axios.get(
        `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Cache/Redis?api-version=2020-06-01`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      const databases = await Promise.all(
        response.data.value.map(async (cache: any) => {
          const keysResponse = await axios.post(
            `https://management.azure.com${cache.id}/listKeys?api-version=2020-06-01`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )

          return {
            id: cache.id,
            name: cache.name,
            type: cache.type,
            location: cache.location,
            properties: {
              ...cache.properties,
              connectionString: `${cache.properties.hostName}:${cache.properties.sslPort},password=${keysResponse.data.primaryKey},ssl=True`,
              host: cache.properties.hostName,
              port: cache.properties.sslPort,
              password: keysResponse.data.primaryKey,
              useSsl: true,
            },
          }
        })
      )

      return databases
    } catch (error) {
      this.logger.error(`Failed to fetch Azure Redis databases for subscription ${subscriptionId}`, error)
      throw error
    }
  }
}