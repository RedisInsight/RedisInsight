import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { isNull, isNumber, every, values, pick, some } from 'lodash'
import { Pages } from 'uiSrc/constants'
import { ADD_NEW_CA_CERT, ADD_NEW } from 'uiSrc/pages/home/constants'
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
import { Nullable, transformQueryParamsObject, parseRedisUrl } from 'uiSrc/utils'

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

      // rename cloudBdbId to cloudId
      urlProperties.cloudId = urlProperties.cloudBdbId
      delete urlProperties.cloudBdbId

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
        dispatch(setFromUrl(from))
        history.replace({
          search: ''
        })
      }
    } catch {
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
        redirect,
        requiredTls,
        requiredCaCert,
        requiredClientCert,
      } = properties

      const cloudDetails = transformQueryParamsObject(
        pick(
          properties,
          ['cloudId', 'subscriptionType', 'planMemoryLimit', 'memoryLimitMeasurementUnit', 'free']
        )
      )

      const url = parseRedisUrl(redisUrl)

      if (!url) return

      const obligatoryForAutoConnectFields = {
        host: url.host,
        port: url.port || 6379,
        username: url.username,
        password: url.password,
      }

      const tlsFields = {
        requiredTls,
        requiredCaCert,
        requiredClientCert,
      }

      const isAllObligatoryProvided = every(values(obligatoryForAutoConnectFields), (value) => value || isNumber(value))
      const isTlsProvided = some(values(tlsFields), (value) => value === 'true')

      const db = {
        ...obligatoryForAutoConnectFields,
        name: databaseAlias || url.hostname || url.host,
      } as any

      if (isAllObligatoryProvided && !isTlsProvided) {
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
          // set tls with new cert option
          tls: isTlsProvided,
          caCert: requiredCaCert === 'true' ? { id: ADD_NEW_CA_CERT } : undefined,
          clientCert: requiredClientCert === 'true' ? { id: ADD_NEW } : undefined,
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
