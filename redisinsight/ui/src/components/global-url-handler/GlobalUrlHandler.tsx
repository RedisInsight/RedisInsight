import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { ConnectionString } from 'connection-string'
import { isNull, isNumber, every, values, pick, isEmpty } from 'lodash'
import { Pages, REDIS_URI_SCHEMES } from 'uiSrc/constants'
import {
  appRedirectionSelector,
  setFromUrl,
  setUrlDbConnection,
  setUrlHandlingInitialState,
  setUrlProperties
} from 'uiSrc/slices/app/url-handling'
import { userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import { autoCreateAndConnectToInstanceAction } from 'uiSrc/slices/instances/instances'
import { getRedirectionPage } from 'uiSrc/utils/routing'
import { Nullable, transformQueryParamsObject } from 'uiSrc/utils'

const GlobalUrlHandler = () => {
  const { fromUrl } = useSelector(appRedirectionSelector)
  const { isShowConceptsPopup: isShowConsents, config } = useSelector(userSettingsSelector)
  const { search } = useLocation()

  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    // start handling only after closing consent popup
    // including updated consents & from scratch
    if (!fromUrl || isNull(isShowConsents) || isShowConsents || !config) return

    try {
      const actionUrl = new URL(fromUrl)
      const fromParams = new URLSearchParams(actionUrl.search)

      // @ts-ignore
      const urlProperties = Object.fromEntries(fromParams) || {}
      dispatch(setUrlProperties(urlProperties))
      dispatch(setFromUrl(null))

      const pathname = actionUrl.hostname + actionUrl.pathname
      if (pathname?.replace(/^(\/\/?)/g, '') === UrlHandlingActions.Connect) {
        connectToDatabase(urlProperties)
      }
    } catch (_e) {
      //
    }
  }, [fromUrl, config, isShowConsents])

  useEffect(() => {
    try {
      const params = new URLSearchParams(search)
      const from = params.get('from')

      if (from) {
        dispatch(setFromUrl(decodeURIComponent(from)))
        history.replace({
          search: ''
        })
      }
    } catch (_e) {
      // do nothing
    }
  }, [search])

  const onSuccessConnectToDb = (id: string, redirectPage: Nullable<string>) => {
    if (redirectPage) {
      const pageToRedirect = getRedirectionPage(redirectPage, id)

      if (pageToRedirect) {
        history.push(pageToRedirect)
        return
      }
    }

    history.push(Pages.browser(id))
  }

  const connectToDatabase = (properties: Record<string, any>) => {
    try {
      const {
        redisUrl,
        databaseAlias,
        requiredTls,
        redirect,
      } = properties

      const cloudDetails = transformQueryParamsObject(
        pick(
          properties,
          ['cloudId', 'subscriptionType', 'planMemoryLimit', 'memoryLimitMeasurementUnit', 'free']
        )
      )

      const url = new ConnectionString(redisUrl)

      /* If a protocol exists, it should be a redis protocol */
      if (url.protocol && !REDIS_URI_SCHEMES.includes(url.protocol)) return

      const obligatoryForAutoConnectFields = {
        host: url.hostname,
        port: url.port,
        username: url.user,
        password: url.password
      }

      const isAllObligatoryProvided = every(values(obligatoryForAutoConnectFields), (value) => value || isNumber(value))

      const db = {
        ...obligatoryForAutoConnectFields,
        name: databaseAlias || url.host,
      } as any

      if (isAllObligatoryProvided && requiredTls !== 'true') {
        if (cloudDetails?.cloudId) {
          db.cloudDetails = cloudDetails
        }
        dispatch(setUrlHandlingInitialState())
        dispatch(autoCreateAndConnectToInstanceAction(db, (id) => onSuccessConnectToDb(id, redirect)))

        return
      }

      dispatch(setUrlDbConnection({
        action: UrlHandlingActions.Connect,
        dbConnection: {
          ...db,
          tls: requiredTls === 'true',
        }
      }))

      history.push(Pages.home)
    } catch (e) {
      //
    }
  }

  return null
}

export default GlobalUrlHandler
