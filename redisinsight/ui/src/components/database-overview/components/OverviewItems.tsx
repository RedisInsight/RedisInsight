import React from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiLoadingSpinner } from '@elastic/eui'

import { formatBytes, Nullable, truncateNumberToRange, truncatePercentage } from 'uiSrc/utils'
import { Theme } from 'uiSrc/constants'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import {
  KeyTipIcon,
  KeyDarkIcon,
  KeyLightIcon,
  MemoryDarkIcon,
  MemoryLightIcon,
  MeasureTipIcon,
  MeasureDarkIcon,
  MeasureLightIcon,
  TimeDarkIcon,
  TimeLightIcon,
  UserDarkIcon,
  UserLightIcon,
  UserTipIcon,
  InputLightIcon,
  InputTipIcon,
  OutputLightIcon,
  OutputTipIcon,
} from 'uiSrc/components/database-overview/components/icons'

import styles from 'uiSrc/components/database-overview/styles.module.scss'

interface Props {
  theme: string;
  items: {
    usedMemory: Nullable<number>;
    totalKeys: Nullable<number>;
    connectedClients: Nullable<number>;
    opsPerSecond: Nullable<number>;
    networkInKbps: Nullable<number>;
    networkOutKbps: Nullable<number>;
    cpuUsagePercentage: Nullable<number>;
  };
}

export const getOverviewItems = ({ theme, items }: Props) => {
  const {
    usedMemory,
    totalKeys,
    connectedClients = 0,
    cpuUsagePercentage,
    opsPerSecond,
    networkInKbps,
    networkOutKbps
  } = items

  const commandsPerSecTooltip = [
    {
      id: 'commands-per-sec-tip',
      title: 'Commands/Sec',
      icon: theme === Theme.Dark ? MeasureTipIcon : MeasureLightIcon,
      value: opsPerSecond
    },
    {
      id: 'network-input-tip',
      title: 'Network Input',
      icon: theme === Theme.Dark ? InputTipIcon : InputLightIcon,
      value: `${networkInKbps} kbps`
    },
    {
      id: 'network-output-tip',
      title: 'Network Output',
      icon: theme === Theme.Dark ? OutputTipIcon : OutputLightIcon,
      value: `${networkOutKbps} kbps`
    }
  ]

  const getConnectedClient = (connectedClients: number = 0) =>
    (Number.isInteger(connectedClients) ? connectedClients : `~${Math.round(connectedClients)}`)

  return [
    {
      id: 'overview-cpu',
      tooltip: {
        title: 'CPU',
        content: cpuUsagePercentage === null ? 'Calculating CPU in progress' : `${truncatePercentage(cpuUsagePercentage, 4)} %`
      },
      className: styles.cpuWrapper,
      icon: cpuUsagePercentage !== null ? (theme === Theme.Dark ? TimeDarkIcon : TimeLightIcon) : null,
      content: cpuUsagePercentage === null ? (
        <>
          <div className={styles.calculationWrapper}>
            <EuiLoadingSpinner className={styles.spinner} size="m" />
            <span className={styles.calculation}>Calculating...</span>
          </div>
        </>
      ) : `${truncatePercentage(cpuUsagePercentage, 2)} %`,
    },
    {
      id: 'overview-commands-sec',
      tooltip: {
        content: commandsPerSecTooltip.map((tooltipItem) => (
          <EuiFlexGroup
            className={styles.commandsPerSecTip}
            key={tooltipItem.id}
            gutterSize="none"
            responsive={false}
            alignItems="center"
          >
            <EuiFlexItem grow={false}>
              <EuiIcon
                className={styles.moreInfoOverviewIcon}
                size="m"
                type={tooltipItem.icon}
              />
            </EuiFlexItem>
            <EuiFlexItem className={styles.moreInfoOverviewContent} grow={false}>
              {tooltipItem.value}
            </EuiFlexItem>
            <EuiFlexItem className={styles.moreInfoOverviewTitle} grow={false}>
              {tooltipItem.title}
            </EuiFlexItem>
          </EuiFlexGroup>
        ))
      },
      icon: theme === Theme.Dark ? MeasureDarkIcon : MeasureLightIcon,
      content: opsPerSecond,
    },
    {
      id: 'overview-total-memory',
      tooltip: {
        title: 'Total Memory',
        content: formatBytes(usedMemory || 0, 3)
      },
      icon: theme === Theme.Dark ? MemoryDarkIcon : MemoryLightIcon,
      content: formatBytes(usedMemory || 0, 0),
    },
    {
      id: 'overview-total-keys',
      tooltip: {
        title: 'Total Keys',
        content: numberWithSpaces(totalKeys || 0)
      },
      icon: theme === Theme.Dark ? KeyDarkIcon : KeyLightIcon,
      tooltipIcon: theme === Theme.Dark ? KeyTipIcon : KeyLightIcon,
      content: truncateNumberToRange(totalKeys || 0),
    },
    {
      id: 'overview-connected-clients',
      tooltip: {
        title: 'Connected Clients',
        content: getConnectedClient(connectedClients ?? 0)
      },
      icon: theme === Theme.Dark ? UserDarkIcon : UserLightIcon,
      tooltipIcon: theme === Theme.Dark ? UserTipIcon : UserLightIcon,
      content: getConnectedClient(connectedClients ?? 0),
    }
  ]
}
