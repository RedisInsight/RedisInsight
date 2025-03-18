import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { MicrosoftAuthService } from '../../auth/microsoft-auth/microsoft-azure-auth.service'

@Injectable()
export class AzureAutodiscoveryService {
  public readonly logger = new Logger(AzureAutodiscoveryService.name)
  private readonly client: AxiosInstance;
  private readonly baseUrl = 'https://management.azure.com';
  private readonly timeout = 30000;

  constructor(
    private readonly microsoftAuthService: MicrosoftAuthService,
  ) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
    });
  }

  async getSubscriptions() {
    try {
      const accessToken = await this.microsoftAuthService.getAccessToken()
      if (!accessToken) {
        throw new UnauthorizedException('No Azure access token available')
      }

      // Set the authorization header for this request
      this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const response = await this.client.get(
        '/subscriptions?api-version=2024-08-01'
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

      // Set the authorization header for this request
      this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const response = await this.client.get(
        `/subscriptions/${subscriptionId}/providers/Microsoft.Cache/Redis?api-version=2020-06-01`
      )
      console.log('response.data', response.data)
      const databases = await Promise.all(
        response.data.value.map(async (cache: any) => {
          console.log('cache', cache)
          const keysResponse = await this.client.post(
            `${cache.id.startsWith('/') ? cache.id : `/${cache.id}`}/listKeys?api-version=2020-06-01`,
            {}
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