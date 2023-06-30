import { get } from 'lodash'
import { FeatureFlags } from 'uiSrc/constants'
import { setSignInDialogState } from 'uiSrc/slices/oauth/cloud'
import { SignInDialogSource } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
// import store from 'uiSrc/slices/store'

export const handleFreeDatabaseClick = async (e: React.MouseEvent, source: SignInDialogSource) => {
  //
  const { default: store } = await import('uiSrc/slices/store')

  const state = store?.getState()

  const isCloudSSOEnabled = get(
    state,
    `app.features.featureFlags.features.${FeatureFlags.cloudSso}.flag`,
    false
  )

  if (!isCloudSSOEnabled) {
    return
  }
  e?.preventDefault()

  const isSignedIn = get(state, 'app.oauth.account', null)

  if (isSignedIn) {
    return
  }

  store?.dispatch(setSignInDialogState?.(source))

  sendEventTelemetry?.({
    event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
    eventData: { source },
  })
}
