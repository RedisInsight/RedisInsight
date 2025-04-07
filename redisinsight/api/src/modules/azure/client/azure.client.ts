import { Logger } from '@nestjs/common'

export interface AzureClientMetadata {
  id: string
}

export abstract class AzureClient {
  protected readonly logger = new Logger(AzureClient.name)

  constructor(
    protected readonly clientMetadata: AzureClientMetadata,
  ) {}

  abstract getSubscriptions(): Promise<any[]>
  abstract getDatabases(subscriptionId: string): Promise<any[]>
  abstract getDatabasesFromMultipleSubscriptions(subscriptions: { id: string }[]): Promise<any[]>
  abstract getDatabaseKeys(databaseId: string): Promise<any>
}