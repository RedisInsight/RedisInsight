import axios, { AxiosInstance } from 'axios'
import { AzureClient, AzureClientMetadata } from './azure.client'
import { AzureSubscription, AzureRedisDatabase, AzureErrorResponse, AzureRedisKeys } from './azure.interfaces'

const AZURE_TIMEOUT = 60000

export class ApiAzureClient extends AzureClient {
  protected readonly client: AxiosInstance

  constructor(clientMetadata: AzureClientMetadata) {
    super(clientMetadata)
    this.client = axios.create({
      baseURL: 'https://management.azure.com',
      timeout: AZURE_TIMEOUT,
    })
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  async getSubscriptions(): Promise<AzureSubscription[]> {
    try {
      const { data } = await this.client.get<{value: AzureSubscription[]}>('/subscriptions?api-version=2020-01-01')
      return data.value || []
    } catch (error) {
      this.logger.error('Failed to fetch Azure subscriptions', error)
      throw this.wrapAzureError(error)
    }
  }

  async getDatabases(subscriptionId: string): Promise<AzureRedisDatabase[]> {
    try {
      const { data } = await this.client.get<{value: AzureRedisDatabase[]}>(
        `/subscriptions/${subscriptionId}/providers/Microsoft.Cache/Redis?api-version=2020-06-01`
      )
      return data.value || []
    } catch (error) {
      this.logger.error(`Failed to fetch databases for subscription ${subscriptionId}`, error)
      throw this.wrapAzureError(error)
    }
  }

  async getDatabaseKeys(databaseId: string): Promise<AzureRedisKeys> {
    try {
      const { data } = await this.client.post<AzureRedisKeys>(
        `${databaseId}/listKeys?api-version=2020-06-01`,
        {}
      )
      return data
    } catch (error) {
      this.logger.error(`Failed to fetch keys for database ${databaseId}`, error)
      throw this.wrapAzureError(error)
    }
  }

  async getDatabasesFromMultipleSubscriptions(
    subscriptions: Pick<AzureSubscription, 'id'>[]
  ): Promise<AzureRedisDatabase[][]> {
    if (!subscriptions || !Array.isArray(subscriptions)) {
      return []
    }

    try {
      const databasePromises = subscriptions.map(subscription =>
        this.getDatabases(subscription.id)
          .catch(error => {
            this.logger.error(`Error fetching databases for subscription ${subscription.id}`, error)
            return []
          })
      )

      return await Promise.all(databasePromises)
    } catch (error) {
      this.logger.error('Error in batch database fetch operation', error)
      throw this.wrapAzureError(error)
    }
  }

  private wrapAzureError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response as { status: number, data: AzureErrorResponse }
      return new Error(`Azure API error (${status}): ${JSON.stringify(data)}`)
    }

    if (error.request) {
      return new Error(`Azure API network error: ${error.message}`)
    }

    return error instanceof Error ? error : new Error(String(error))
  }
}