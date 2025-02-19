import React, { ReactNode } from 'react'
import { EuiLoadingSpinner } from '@elastic/eui'
import { isArray, isUndefined, toNumber } from 'lodash'

import { formatBytes, Nullable, toBytes, truncateNumberToRange, truncatePercentage } from 'uiSrc/utils'
import { Theme } from 'uiSrc/constants'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import {
  KeyDarkIcon,
  KeyLightIcon,
  MemoryDarkIcon,
  MemoryLightIcon,
  MeasureDarkIcon,
  MeasureLightIcon,
  TimeDarkIcon,
  TimeLightIcon,
  UserDarkIcon,
  UserLightIcon,
  InputLightIcon,
  OutputLightIcon,
  InputDarkIcon,
  OutputDarkIcon,
} from 'uiSrc/components/database-overview/components/icons'

import styles from './styles.module.scss'

interface Props {
  theme: string
  db?: number
  items: {
    version: string,
    usedMemory?: Nullable<number>
    usedMemoryPercent?: Nullable<number>
    totalKeys?: Nullable<number>
    connectedClients?: Nullable<number>
    opsPerSecond?: Nullable<number>
    networkInKbps?: Nullable<number>
    networkOutKbps?: Nullable<number>
    cpuUsagePercentage?: Nullable<number>
    totalKeysPerDb?: Nullable<{ [key: string]: number }>
    cloudDetails?: {
      cloudId: number
      subscriptionId: number;
      subscriptionType: 'fixed' | 'flexible'
      planMemoryLimit: number
      memoryLimitMeasurementUnit: string
    }
  }
}

export interface IMetric {
  id: string
  content: ReactNode
  value: any
  unavailableText: string
  title: string
  tooltip: {
    title?: string
    icon: Nullable<string>
    content: ReactNode | string
  }
  loading?: boolean
  groupId?: string
  icon?: Nullable<string>
  className?: string
  children?: Array<IMetric>
}

export const getOverviewMetrics = ({ theme, items, db = 0 }: Props): Array<IMetric> => {
  const {
    usedMemory,
    usedMemoryPercent,
    totalKeys,
    connectedClients,
    cpuUsagePercentage,
    opsPerSecond,
    networkInKbps,
    networkOutKbps,
    totalKeysPerDb = {},
    cloudDetails
  } = items

  const availableItems: Array<IMetric> = []

  // CPU
  if (!isUndefined(cpuUsagePercentage)) {
    availableItems.push({
      id: 'overview-cpu',
      title: 'CPU',
      value: cpuUsagePercentage,
      loading: cpuUsagePercentage === null,
      unavailableText: 'CPU is not available',
      tooltip: {
        title: 'CPU',
        icon: theme === Theme.Dark ? TimeDarkIcon : TimeLightIcon,
        content: cpuUsagePercentage === null
          ? 'Calculating in progress'
          : (
            <>
              <b>{truncatePercentage(cpuUsagePercentage, 4)}</b>
              &nbsp;%
            </>
          ),
      },
      className: styles.cpuWrapper,
      icon: cpuUsagePercentage !== null ? theme === Theme.Dark ? TimeDarkIcon : TimeLightIcon : null,
      content: cpuUsagePercentage === null ? (
        <>
          <div className={styles.calculationWrapper}>
            <EuiLoadingSpinner className={styles.spinner} size="m" />
            <span className={styles.calculation}>Calculating...</span>
          </div>
        </>
      ) : `${truncatePercentage(cpuUsagePercentage, 2)} %`,
    })
  }

  // Ops per second with tooltip
  const opsPerSecItem: any = {
    id: 'overview-commands-sec',
    icon: theme === Theme.Dark ? MeasureDarkIcon : MeasureLightIcon,
    content: opsPerSecond,
    value: opsPerSecond,
    unavailableText: 'Commands/s are not available',
    title: 'Commands/s',
    tooltip: {
      icon: theme === Theme.Dark ? MeasureDarkIcon : MeasureLightIcon,
      content: opsPerSecond
    },
  }

  let [networkIn, networkInUnit] = formatBytes(networkInKbps * 1000, 3, true, 1000)
  networkInUnit = networkInUnit ? `${networkInUnit.toLowerCase()}/s` : ''
  let [networkOut, networkOutUnit] = formatBytes(networkOutKbps * 1000, 3, true, 1000)
  networkOutUnit = networkOutUnit ? `${networkOutUnit.toLowerCase()}/s` : ''

  const networkInItem = {
    id: 'network-input',
    groupId: opsPerSecItem.id,
    title: 'Network Input',
    icon: theme === Theme.Dark ? InputDarkIcon : InputLightIcon,
    value: networkIn,
    content: (
      <>
        <b>{networkIn}</b>
        &nbsp;{networkInUnit}
      </>
    ),
    unavailableText: 'Network Input is not available',
    tooltip: {
      title: 'Network Input',
      icon: theme === Theme.Dark ? InputDarkIcon : InputLightIcon,
      content: (
        <>
          <b>{networkIn}</b>
          &nbsp;{networkInUnit}
        </>
      ),
    },
  }

  const networkOutItem = {
    id: 'network-output-tip',
    groupId: opsPerSecItem.id,
    title: 'Network Output',
    icon: theme === Theme.Dark ? OutputDarkIcon : OutputLightIcon,
    value: networkOut,
    content: (
      <>
        <b>{networkOut}</b>
        &nbsp;{networkOutUnit}
      </>
    ),
    unavailableText: 'Network Output is not available',
    tooltip: {
      title: 'Network Output',
      icon: theme === Theme.Dark ? OutputDarkIcon : OutputLightIcon,
      content: (
        <>
          <b>{networkOut}</b>
          &nbsp;{networkOutUnit}
        </>
      ),
    },
  }

  if (!isUndefined(opsPerSecond)) {
    opsPerSecItem.children = [
      {
        id: 'commands-per-sec-tip',
        title: 'Commands/s',
        icon: theme === Theme.Dark ? MeasureDarkIcon : MeasureLightIcon,
        value: opsPerSecond,
        content: opsPerSecond,
        unavailableText: 'Commands/s are not available',
      },
      networkInItem,
      networkOutItem
    ]
  }

  opsPerSecond !== undefined && availableItems.push(opsPerSecItem)

  // Used memory
  const planMemoryLimit = cloudDetails?.planMemoryLimit
  const memoryUsed = formatBytes(usedMemory || 0, 0)
  const planMemory = planMemoryLimit ? formatBytes(toBytes(planMemoryLimit, cloudDetails?.memoryLimitMeasurementUnit || 'MB') || 0, 1) : ''

  const memoryContent = planMemoryLimit
    ? (
      <span>{memoryUsed} / <strong>{planMemory}</strong> ({usedMemoryPercent}%)</span>
    ) : memoryUsed
  const memoryUsedTooltip = planMemory ? ` / ${planMemory} (${usedMemoryPercent}%)` : ''

  const formattedUsedMemoryTooltip = formatBytes(usedMemory || 0, 3, true)
  usedMemory !== undefined && availableItems.push({
    id: 'overview-total-memory',
    value: usedMemory,
    unavailableText: 'Total Memory is not available',
    title: 'Total Memory',
    tooltip: {
      title: 'Total Memory',
      icon: theme === Theme.Dark ? MemoryDarkIcon : MemoryLightIcon,
      content: isArray(formattedUsedMemoryTooltip)
        ? (
          <>
            <b>{formattedUsedMemoryTooltip[0]}</b>
            &nbsp;
            {formattedUsedMemoryTooltip[1]}
            {memoryUsedTooltip}
          </>
        )
        : `${formattedUsedMemoryTooltip}${memoryUsedTooltip}`,
    },
    icon: theme === Theme.Dark ? MemoryDarkIcon : MemoryLightIcon,
    content: memoryContent,
  })

  // Total keys
  const totalKeysItem: any = {
    id: 'overview-total-keys',
    value: totalKeys,
    unavailableText: 'Total Keys are not available',
    title: 'Total Keys',
    tooltip: {
      title: 'Total Keys',
      content: (<b>{numberWithSpaces(totalKeys || 0)}</b>),
      icon: theme === Theme.Dark ? KeyDarkIcon : KeyLightIcon,
    },
    icon: theme === Theme.Dark ? KeyDarkIcon : KeyLightIcon,
    content: truncateNumberToRange(totalKeys || 0),
  }

  // keys in the logical database
  const dbKeysCount = totalKeysPerDb?.[`db${db || 0}`]
  if (!isUndefined(dbKeysCount) && dbKeysCount < toNumber(totalKeys)) {
    totalKeysItem.children = [
      {
        id: 'total-keys-tip',
        value: totalKeys,
        unavailableText: 'Total Keys are not available',
        title: 'Total Keys',
        tooltip: {
          title: 'Total Keys',
          content: (<b>{numberWithSpaces(totalKeys || 0)}</b>),
        },
        content: (<b>{numberWithSpaces(totalKeys || 0)}</b>),
      },
      {
        id: 'overview-db-total-keys',
        title: 'Keys',
        value: dbKeysCount,
        content: (
          <>
            <span style={{ fontWeight: 200, paddingRight: 1 }}>db{db || 0}:</span>
            <b>{numberWithSpaces(dbKeysCount || 0)}</b>
          </>
        ),
      },
    ]
  }

  totalKeys !== undefined && availableItems.push(totalKeysItem)

  const getConnectedClient = (connectedClients: number = 0) =>
    (Number.isInteger(connectedClients) ? connectedClients : `~${Math.round(connectedClients)}`)

  // Connected clients
  connectedClients !== undefined && availableItems.push({
    id: 'overview-connected-clients',
    value: connectedClients,
    unavailableText: 'Connected Clients are not available',
    title: 'Connected Clients',
    tooltip: {
      title: 'Connected Clients',
      content: (<b>{getConnectedClient(connectedClients ?? 0)}</b>),
      icon: theme === Theme.Dark ? UserDarkIcon : UserLightIcon,
    },
    icon: theme === Theme.Dark ? UserDarkIcon : UserLightIcon,
    content: getConnectedClient(connectedClients ?? 0),
  })

  return availableItems
}
