import { useEffect } from 'react'
import * as Sentry from '@sentry/react'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

const useSentry = () => {
  useEffect(() => {
    console.log('useSentry')

    if (!riConfig?.app?.sentryDsn) {
      console.log('NO DSN')
      return
    }

    console.log('initialize with DSN')
    Sentry.init({
      dsn: riConfig?.app?.sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Tracing
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', 'ri.k8s-mw.sm-qa.qa.redislabs.com'],
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    })
  }, [riConfig?.app?.sentryDsn])
}

export default useSentry
