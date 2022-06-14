import React, { ReactNode } from 'react'
import { EuiLoadingSpinner } from '@elastic/eui'
import { isArray, isUndefined } from 'lodash'

import { formatBytes, Nullable, truncateNumberToRange, truncatePercentage } from 'uiSrc/utils'
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
  theme: string;
  items: {
    version: string,
    usedMemory?: Nullable<number>;
    totalKeys?: Nullable<number>;
    connectedClients?: Nullable<number>;
    opsPerSecond?: Nullable<number>;
    networkInKbps?: Nullable<number>;
    networkOutKbps?: Nullable<number>;
    cpuUsagePercentage?: Nullable<number>;
  };
}

export interface IMetric {
  id: string;
  content: ReactNode;
  value: any;
  unavailableText: string;
  title: string;
  tooltip: {
    title?: string;
    icon: Nullable<string>;
    content: ReactNode | string;
  };
  loading?: boolean;
  groupId?: string;
  icon?: Nullable<string>;
  className?: string;
  children?: Array<IMetric>
}

export const getOverviewMetrics = ({ theme, items }: Props): Array<IMetric> => {
  const {
    usedMemory,
    totalKeys,
    connectedClients,
    cpuUsagePercentage,
    opsPerSecond,
    networkInKbps,
    networkOutKbps
  } = items

  const availableItems: Array<IMetric> = []

  // CPU
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

  const networkInKbpsItem = {
    id: 'network-input',
    groupId: opsPerSecItem.id,
    title: 'Network Input',
    icon: theme === Theme.Dark ? InputDarkIcon : InputLightIcon,
    value: networkInKbps,
    content: (
      <>
        <b>{networkInKbps}</b>
        &nbsp;kb/s
      </>
    ),
    unavailableText: 'Network Input is not available',
    tooltip: {
      title: 'Network Input',
      icon: theme === Theme.Dark ? InputDarkIcon : InputLightIcon,
      content: (
        <>
          <b>{networkInKbps}</b>
          &nbsp;kb/s
        </>
      ),
    },
  }

  const networkOutKbpsItem = {
    id: 'network-output-tip',
    groupId: opsPerSecItem.id,
    title: 'Network Output',
    icon: theme === Theme.Dark ? OutputDarkIcon : OutputLightIcon,
    value: networkOutKbps,
    content: (
      <>
        <b>{networkOutKbps}</b>
        &nbsp;kb/s
      </>
    ),
    unavailableText: 'Network Output is not available',
    tooltip: {
      title: 'Network Output',
      icon: theme === Theme.Dark ? OutputDarkIcon : OutputLightIcon,
      content: (
        <>
          <b>{networkOutKbps}</b>
          &nbsp;kb/s
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
      networkInKbpsItem,
      networkOutKbpsItem
    ]
  }

  availableItems.push(opsPerSecItem)
  availableItems.push(networkInKbpsItem)
  availableItems.push(networkOutKbpsItem)

  // Used memory
  const formattedUsedMemoryTooltip = formatBytes(usedMemory || 0, 3, true)
  availableItems.push({
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
          </>
        )
        : formattedUsedMemoryTooltip
    },
    icon: theme === Theme.Dark ? MemoryDarkIcon : MemoryLightIcon,
    content: formatBytes(usedMemory || 0, 0),
  })

  // Total keys
  availableItems.push({
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
  })

  const getConnectedClient = (connectedClients: number = 0) =>
    (Number.isInteger(connectedClients) ? connectedClients : `~${Math.round(connectedClients)}`)

  // Connected clients
  availableItems.push({
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
