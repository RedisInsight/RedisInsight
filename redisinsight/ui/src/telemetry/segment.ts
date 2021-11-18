import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { ITelemetryService, ITelemetryEvent } from './interfaces'
import loadSegmentAnalytics from './loadSegmentAnalytics'

export const NON_TRACKING_ANONYMOUS_ID = 'UNSET'
const isWebApp = process.env.APP_ENV === 'web'

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

  private _getPageInfo = (): IContextPage => {
    const pageObject: IContextPage = {}

    if (!isWebApp) {
      pageObject.page = {
        path: '', url: '', title: globalThis.document.title
      }
    }

    return pageObject
  }

  constructor(private _sourceWriteKey: string) {
    this._sourceWriteKey = _sourceWriteKey
  }

  async initialize(): Promise<void> {
    loadSegmentAnalytics(this._sourceWriteKey)
  }

  get anonymousId(): string {
    return this._anonymousId
  }

  async pageView(name: string, databaseId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const pageInfo = this._getPageInfo()
        const { page = {} } = { ...pageInfo }
        window.analytics.page(name, { databaseId, ...page }, {
          context: {
            ip: '0.0.0.0',
            ...pageInfo
          }
        }, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  async identify({ installationId }: { installationId: string }): Promise<void> {
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
        window.analytics.track(event, properties, { context: { ip: '0.0.0.0', ...this._getPageInfo() } }, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }
}
