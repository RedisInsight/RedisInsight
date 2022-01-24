import React from 'react'
import { CONNECTION_TYPE_DISPLAY, ConnectionType } from 'uiSrc/slices/interfaces'
import { capitalize } from 'lodash'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

interface IProps {
  name: string;
  connectionType: ConnectionType;
  version: string;
  dbIndex: number;
  user?: Nullable<string>;
}
const ShortInstanceInfo = (props: IProps) => {
  const { name, connectionType, version, user, dbIndex } = props
  return ((
    <div>
      <div className={styles.tooltipItem}>
        <b>Database Name</b>
        :
        <span className={styles.tooltipItemValue}>{dbIndex > 0 ? `${name} [${dbIndex}]` : name }</span>
      </div>
      <div className={styles.tooltipItem}>
        <b>Connection</b>
        :
        <span className={styles.tooltipItemValue}>
          {connectionType ? CONNECTION_TYPE_DISPLAY[connectionType] : capitalize(connectionType)}
        </span>
      </div>
      <div className={styles.tooltipItem}>
        <b>Version</b>
        :
        <span className={styles.tooltipItemValue}>{version}</span>
      </div>
      <div className={styles.tooltipItem}>
        <b>Username</b>
        :
        <span className={styles.tooltipItemValue}>{user || 'Default'}</span>
      </div>
    </div>
  ))
}

export default ShortInstanceInfo
