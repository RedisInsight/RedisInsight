import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { envVars } from 'uiSrc/utils'
import { ITelemetryService, ITelemetryEvent, ITelemetryIdentify } from './interfaces'
import loadSegmentAnalytics from './loadSegmentAnalytics'

export const NON_TRACKING_ANONYMOUS_ID = 'UNSET'
const isWebApp = envVars.APP_ENV === 'web'

interface IContextPage {
  page?: IContextPageInfo;
}

interface IContextPageInfo {
  path?: string;
  url?: string;
  title?: string;
}

export class SegmentTelemetryService implements ITelemetryService {
  private _anonymousId: string = ''

  private _sessionId: number = -1

  private readonly _sourceWriteKey: string

  constructor(sourceWriteKey: string) {
    this._sourceWriteKey = sourceWriteKey
  }

  private _getPageInfo = (): IContextPage => {
    const pageObject: IContextPage = {}

    if (!isWebApp) {
      pageObject.page = {
        path: '', url: '', title: ''
      }
    } else {
      pageObject.page = {
        ...pageObject.page, title: ''
      }
    }

    return pageObject
  }

  async initialize(): Promise<void> {
    loadSegmentAnalytics(this._sourceWriteKey)
  }

  get anonymousId(): string {
    return this._anonymousId
  }

  async pageView(
    name: string,
    properties: object
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const pageInfo = this._getPageInfo()
        const { page = {} } = { ...pageInfo }
        window.analytics.page(name, { ...properties, ...page }, {
          context: {
            ip: '0.0.0.0',
            ...pageInfo
          },
          integrations: {
            Amplitude: {
              session_id: this._sessionId,
            }
          },
        }, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  async identify({ installationId, sessionId }: ITelemetryIdentify): Promise<void> {
    this._sessionId = sessionId || -1
    if (this._anonymousId) {
      return Promise.resolve()
    }
    this._anonymousId = installationId

    // Telemetry doesn't watch on sending anonymousId like arg of function. Only looks at localStorage
    localStorageService.set(BrowserStorageItem.segmentAnonymousId, JSON.stringify(installationId))

    return new Promise((resolve, reject) => {
      try {
        window.analytics.identify(
          // empty traits object
          {},
          // segment options
          {
            anonymousId: installationId,
            // Anonymize IP
            context: {
              ip: '0.0.0.0',
              ...this._getPageInfo()
            },
          },
          resolve
        )
      } catch (e) {
        reject(e)
      }
    })
  }

  async event({ event, properties }: ITelemetryEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        window.analytics.track(event, properties, {
          context: { ip: '0.0.0.0', ...this._getPageInfo() },
          integrations: {
            Amplitude: {
              session_id: this._sessionId,
            }
          },
        }, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }
}
