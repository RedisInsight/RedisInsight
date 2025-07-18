import React from 'react'
import { capitalize } from 'lodash'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { ColorText, Text } from 'uiSrc/components/base/text'
import {
  Group as ListGroup,
  Item as ListGroupItem,
} from 'uiSrc/components/base/layout/list'
import { SentinelMaster } from 'uiSrc/api-client'
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
          <Text color="subdued" size="s">
            Connection Type:
            <ColorText color="default" className={styles.dbInfoListValue}>
              {capitalize(connectionType)}
            </ColorText>
          </Text>
        }
      />

      {sentinelMaster?.name && (
        <ListGroupItem
          label={
            <Text color="subdued" size="s">
              Primary Group Name:
              <ColorText color="default" className={styles.dbInfoListValue}>
                {sentinelMaster?.name}
              </ColorText>
            </Text>
          }
        />
      )}

      {nameFromProvider && (
        <ListGroupItem
          label={
            <Text color="subdued" size="s">
              Database Name from Provider:
              <ColorText color="default" className={styles.dbInfoListValue}>
                {nameFromProvider}
              </ColorText>
            </Text>
          }
        />
      )}

      {host && port && <SentinelHostPort host={host} port={port} />}
    </ListGroup>
  )
}

export default DbInfoSentinel
