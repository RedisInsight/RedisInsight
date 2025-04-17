import React from 'react'
import { EuiText, EuiTextColor } from '@elastic/eui'

import { capitalize } from 'lodash'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import {
  Group as ListGroup,
  Item as ListGroupItem,
} from 'uiSrc/components/base/layout/list'
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
    <ListGroup className={styles.dbInfoGroup} flush>
      <ListGroupItem
        label={
          <EuiText color="subdued" size="s">
            Connection Type:
            <EuiTextColor color="default" className={styles.dbInfoListValue}>
              {capitalize(connectionType)}
            </EuiTextColor>
          </EuiText>
        }
      />

      {sentinelMaster?.name && (
        <ListGroupItem
          label={
            <EuiText color="subdued" size="s">
              Primary Group Name:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {sentinelMaster?.name}
              </EuiTextColor>
            </EuiText>
          }
        />
      )}

      {nameFromProvider && (
        <ListGroupItem
          label={
            <EuiText color="subdued" size="s">
              Database Name from Provider:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {nameFromProvider}
              </EuiTextColor>
            </EuiText>
          }
        />
      )}

      {host && port && <SentinelHostPort host={host} port={port} />}
    </ListGroup>
  )
}

export default DbInfoSentinel
