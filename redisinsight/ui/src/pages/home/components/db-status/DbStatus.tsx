import React from 'react'
import { EuiIcon, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import { differenceInDays } from 'date-fns'

import { useSelector } from 'react-redux'
import { getTutorialCapability, Maybe } from 'uiSrc/utils'

import { appContextCapability } from 'uiSrc/slices/app/context'

import AlarmIcon from 'uiSrc/assets/img/alarm.svg'
import { isShowCapabilityTutorialPopover } from 'uiSrc/services'
import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'
import { CHECK_CLOUD_DATABASE, WARNING_WITH_CAPABILITY, WARNING_WITHOUT_CAPABILITY } from './texts'
import styles from './styles.module.scss'

export interface Props {
  id: string
  lastConnection: Maybe<Date>
  createdAt: Maybe<Date>
  isNew: boolean
  isFree?: boolean
}

export enum WarningTypes {
  CheckIfDeleted = 'checkIfDeleted',
  TryDatabase = 'tryDatabase',
}

interface WarningTooltipProps {
  id: string
  content : React.ReactNode
  capabilityTelemetry?: string
  type?: string
  isCapabilityNotShown?: boolean
}

const LAST_CONNECTION_SM = 3
const LAST_CONNECTION_L = 16

const DbStatus = (props: Props) => {
  const { id, lastConnection, createdAt, isNew, isFree } = props

  const { source } = useSelector(appContextCapability)
  const capability = getTutorialCapability(source!)
  const isCapabilityNotShown = Boolean(isShowCapabilityTutorialPopover(isFree))
  let daysDiff = 0

  try {
    daysDiff = lastConnection
      ? differenceInDays(new Date(), new Date(lastConnection))
      : createdAt ? differenceInDays(new Date(), new Date(createdAt)) : 0
  } catch {
    // nothing to do
  }

  const renderWarningTooltip = (content: React.ReactNode, type?: string) => (
    <EuiToolTip
      content={(
        <WarningTooltipContent
          id={id}
          capabilityTelemetry={capability?.telemetryName}
          content={content}
          type={type}
          isCapabilityNotShown={isCapabilityNotShown}
        />
      )}
      position="right"
      className={styles.tooltip}
      anchorClassName={cx(styles.statusAnchor, styles.warning)}
    >
      <div className={cx(styles.status, styles.warning)} data-testid={`database-status-${type}-${id}`}>!</div>
    </EuiToolTip>
  )

  if (isFree && daysDiff >= LAST_CONNECTION_L) {
    return renderWarningTooltip(CHECK_CLOUD_DATABASE, 'checkIfDeleted')
  }

  if (isFree && daysDiff >= LAST_CONNECTION_SM) {
    return renderWarningTooltip(
      isCapabilityNotShown && capability.name ? WARNING_WITH_CAPABILITY(capability.name) : WARNING_WITHOUT_CAPABILITY,
      'tryDatabase'
    )
  }

  if (isNew) {
    return (
      <EuiToolTip content="New" position="top" anchorClassName={cx(styles.statusAnchor)}>
        <div className={cx(styles.status, styles.new)} data-testid={`database-status-new-${id}`} />
      </EuiToolTip>
    )
  }

  return null
}

// separated to send event when content is displayed
const WarningTooltipContent = (props: WarningTooltipProps) => {
  const { id, content, capabilityTelemetry, type, isCapabilityNotShown } = props

  sendEventTelemetry({
    event: TelemetryEvent.CLOUD_NOT_USED_DB_NOTIFICATION_VIEWED,
    eventData: {
      databaseId: id,
      capability: isCapabilityNotShown ? capabilityTelemetry : TELEMETRY_EMPTY_VALUE,
      type
    }
  })

  return (
    <div className={styles.warningTooltipContent}>
      <EuiIcon type={AlarmIcon} size="original" />
      <div>{content}</div>
    </div>
  )
}

export default DbStatus
