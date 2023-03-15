import React from 'react'
import { capitalize } from 'lodash'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from '@elastic/eui'

import { CONNECTION_TYPE_DISPLAY, ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'

import { ReactComponent as ConnectionIcon } from 'uiSrc/assets/img/icons/connection.svg'
import { ReactComponent as UserIcon } from 'uiSrc/assets/img/icons/user.svg'
import { ReactComponent as VersionIcon } from 'uiSrc/assets/img/icons/version.svg'
import MessageInfoIcon from 'uiSrc/assets/img/icons/help_illus.svg'

import styles from './styles.module.scss'

export interface Props {
  info: {
    name: string
    host: string
    port: string | number
    connectionType: ConnectionType
    version: string
    dbIndex: number
    user?: Nullable<string>
  }
  databases: number
}
const ShortInstanceInfo = ({ info, databases }: Props) => {
  const { name, host, port, connectionType, version, user } = info
  return (
    <div data-testid="db-info-tooltip">
      <div className={styles.tooltipItem}>
        <b style={{ fontSize: 13 }}>{name}</b>
      </div>
      <div className={styles.tooltipItem}>
        <span>
          {host}
          :
          {port}
        </span>
      </div>
      {databases > 1 && (
        <EuiFlexGroup className={styles.dbIndexInfo} alignItems="center" gutterSize="none">
          <EuiFlexItem grow={false} style={{ marginRight: 16 }}>
            <EuiIcon className={styles.messageInfoIcon} size="xxl" type={MessageInfoIcon} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size="s">Logical Databases</EuiText>
            <EuiText color="subdued" size="xs">
              Select logical databases to work with in Browser, Workbench, and Database Analysis.
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
      <EuiFlexGroup
        className={styles.tooltipItem}
        gutterSize="none"
        alignItems="center"
        justifyContent="flexStart"
        responsive={false}
      >
        <EuiFlexItem className={styles.rowTooltipItem} grow={false}>
          <EuiIcon type={ConnectionIcon} />
          <span className={styles.tooltipItemValue}>
            {connectionType ? CONNECTION_TYPE_DISPLAY[connectionType] : capitalize(connectionType)}
          </span>
        </EuiFlexItem>
        <EuiFlexItem className={styles.rowTooltipItem} grow={false}>
          <EuiIcon type={VersionIcon} />
          <span className={styles.tooltipItemValue}>{version}</span>
        </EuiFlexItem>
        <EuiFlexItem className={styles.rowTooltipItem} grow={false}>
          <EuiIcon type={UserIcon} />
          <span className={styles.tooltipItemValue}>{user || 'Default'}</span>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default ShortInstanceInfo
