import log from 'electron-log'
import { AuthStrategy } from './auth.interface'
import { CloudAuthService } from '../../../../api/dist/src/modules/cloud/auth/cloud-auth.service'
import { CloudAuthModule } from '../../../../api/dist/src/modules/cloud/auth/cloud-auth.module'
import { AuthProviderType } from '../../../../api/dist/src/modules/auth/microsoft-auth/models/auth-types'
import { MicrosoftAuthService } from '../../../../api/dist/src/modules/auth/microsoft-auth/microsoft-azure-auth.service'

export class ServiceAuthStrategy implements AuthStrategy {
  private static instance: ServiceAuthStrategy

  private cloudAuthService!: CloudAuthService

  private microsoftAuthService!: MicrosoftAuthService

  private lastAuthType: AuthProviderType | null = null

  private initialized = false

  private beApp: any

  private constructor() { }

  public static getInstance(beApp?: any): ServiceAuthStrategy {
    if (!ServiceAuthStrategy.instance) {
      ServiceAuthStrategy.instance = new ServiceAuthStrategy()
    }
    if (beApp) {
      ServiceAuthStrategy.instance.beApp = beApp
    }
    return ServiceAuthStrategy.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      log.info('[Service Auth] Already initialized')
      return
    }

    log.info('[Service Auth] Initializing service auth')
    try {
      if (!this.beApp) {
        throw new Error('[Service Auth] Backend app not provided')
      }

      this.cloudAuthService = this.beApp.select(CloudAuthModule).get(CloudAuthService)
      this.microsoftAuthService = this.beApp.get(MicrosoftAuthService)
      this.initialized = true
      log.info('[Service Auth] Service auth initialized')
    } catch (err) {
      log.error('[Service Auth] Initialization failed:', err)
      throw err
    }
  }

  getAuthService() {
    return this.lastAuthType === AuthProviderType.Microsoft
      ? this.microsoftAuthService
      : this.cloudAuthService
  }

  async getAuthUrl(options: any): Promise<{ url: string }> {
    this.lastAuthType = options.authOptions?.strategy
    log.info('[Service Auth] Getting auth URL', options.authOptions?.strategy === AuthProviderType.Microsoft, options)

    // Create a default session metadata if not provided
    const sessionMetadata = options.sessionMetadata || {
      sessionId: 'default',
      userId: 'default'
    }

    const url = await this.getAuthService().getAuthorizationUrl(sessionMetadata, options.authOptions)
    log.info('[Service Auth] Auth URL obtained')
    return { url }
  }

  async handleCallback(query: any): Promise<any> {
    if (this.getAuthService().isRequestInProgress(query)) {
      return {
        status: 'succeed',
        action: query.action,
        databaseId: query.databaseId,
        options: query
      }
    }
    const result = await this.getAuthService().handleCallback(query)
    return {
      ...result,
      action: query.action,
      databaseId: query.databaseId,
      options: query
    }
  }

  async shutdown(): Promise<void> {
    log.info('[Service Auth] Shutting down service auth')
  }
}
