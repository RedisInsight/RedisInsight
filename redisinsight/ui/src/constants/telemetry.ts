import { TelemetryEvent, TelemetryPageView } from 'uiSrc/telemetry'

export enum ReleaseNotesSource {
  helpCenter = 'Help Center',
  updateNotification = 'Update notification'
}

export const eventsWithExcludedProvider: string[] = [
  TelemetryPageView.DATABASES_LIST_PAGE,
  TelemetryPageView.SETTINGS_PAGE,
  TelemetryEvent.NOTIFICATIONS_HISTORY_OPENED,
  TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SEARCHED,
  TelemetryEvent.INSIGHTS_PANEL_OPENED,
  TelemetryEvent.INSIGHTS_PANEL_CLOSED,
  TelemetryEvent.INSIGHTS_PANEL_TAB_CHANGED,
  TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_CLICKED,
  TelemetryEvent.CONFIG_DATABASES_CLICKED
]
