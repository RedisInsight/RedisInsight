import React from 'react'
import { EuiListGroup, EuiListGroupItem, EuiText, EuiTextColor } from '@elastic/eui'

import { capitalize } from 'lodash'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { SentinelMaster } from 'apiSrc/modules/redis-sentinel/models/sentinel-master'
import SentinelHostPort from './SentinelHostPort'

import styles from '../../styles.module.scss'

export interface Props {
  host?: string
  port?: string
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  sentinelMaster?: SentinelMaster
}

const DbInfoSentinel = (props: Props) => {
  const { connectionType, nameFromProvider, sentinelMaster, host, port } = props
  return (
    <EuiListGroup className={styles.dbInfoGroup} flush>
      <EuiListGroupItem
        label={(
          <EuiText color="subdued" size="s">
            Connection Type:
            <EuiTextColor color="default" className={styles.dbInfoListValue}>
              {capitalize(connectionType)}
            </EuiTextColor>
          </EuiText>
        )}
      />

      {sentinelMaster?.name && (
        <EuiListGroupItem
          label={(
            <EuiText color="subdued" size="s">
              Primary Group Name:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {sentinelMaster?.name}
              </EuiTextColor>
            </EuiText>
          )}
        />
      )}

      {nameFromProvider && (
        <EuiListGroupItem
          label={(
            <EuiText color="subdued" size="s">
              Database Name from Provider:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {nameFromProvider}
              </EuiTextColor>
            </EuiText>
          )}
        />
      )}

      {host && port && (
        <SentinelHostPort
          host={host}
          port={port}
        />
      )}
    </EuiListGroup>
  )
}

export default DbInfoSentinel
