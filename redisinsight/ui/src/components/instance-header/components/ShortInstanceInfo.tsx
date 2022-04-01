import React from 'react'
import { capitalize } from 'lodash'
import { EuiFlexGroup, EuiFlexItem, EuiIcon } from '@elastic/eui'

import { CONNECTION_TYPE_DISPLAY, ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'

import { ReactComponent as ConnectionIcon } from 'uiSrc/assets/img/icons/connection.svg'
import { ReactComponent as UserIcon } from 'uiSrc/assets/img/icons/user.svg'
import { ReactComponent as VersionIcon } from 'uiSrc/assets/img/icons/version.svg'

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
}
const ShortInstanceInfo = ({ info }: Props) => {
  const { name, host, port, connectionType, version, user, dbIndex } = info
  return ((
    <div data-testid="db-info-tooltip">
      <div className={styles.tooltipItem}>
        <b style={{ fontSize: 13 }}>{dbIndex > 0 ? `${name} [${dbIndex}]` : name }</b>
      </div>
      <div className={styles.tooltipItem}>
        <span>
          {host}
          :
          {port}
        </span>
      </div>
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
  ))
}

export default ShortInstanceInfo
