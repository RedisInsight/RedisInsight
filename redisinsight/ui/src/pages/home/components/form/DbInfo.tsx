import React from 'react'
import { useSelector } from 'react-redux'
import { EuiIcon, EuiToolTip } from '@elastic/eui'
import { capitalize } from 'lodash'
import cx from 'classnames'

import { ColorText, Text } from 'uiSrc/components/base/text'
import { DatabaseListModules } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import {
  Group as ListGroup,
  Item as ListGroupItem,
} from 'uiSrc/components/base/layout/list'
import { Endpoint } from 'apiSrc/common/models'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import styles from '../styles.module.scss'

export interface Props {
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  nodes: Nullable<Endpoint[]>
  host: string
  port: string
  db: Nullable<number>
  modules: AdditionalRedisModule[]
  isFromCloud: boolean
}

const DbInfo = (props: Props) => {
  const {
    connectionType,
    nameFromProvider,
    nodes = null,
    host,
    port,
    db,
    modules,
    isFromCloud,
  } = props

  const { server } = useSelector(appInfoSelector)

  const AppendEndpoints = () => (
    <EuiToolTip
      title="Host:port"
      position="left"
      anchorClassName={styles.anchorEndpoints}
      content={
        <ul className={styles.endpointsList}>
          {nodes?.map(({ host: eHost, port: ePort }) => (
            <li key={host + port}>
              <Text>
                {eHost}:{ePort};
              </Text>
            </li>
          ))}
        </ul>
      }
    >
      <EuiIcon
        type="iInCircle"
        color="subdued"
        title=""
        style={{ cursor: 'pointer' }}
      />
    </EuiToolTip>
  )

  return (
    <ListGroup className={styles.dbInfoGroup} flush>
      {!isFromCloud && (
        <ListGroupItem
          label={
            <Text color="subdued" size="s">
              Connection Type:
              <ColorText
                color="default"
                className={styles.dbInfoListValue}
                data-testid="connection-type"
              >
                {capitalize(connectionType)}
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
      <ListGroupItem
        label={
          <>
            {!!nodes?.length && <AppendEndpoints />}
            <Text color="subdued" size="s">
              Host:
              <ColorText
                color="default"
                className={styles.dbInfoListValue}
                data-testid="db-info-host"
              >
                {host}
              </ColorText>
            </Text>
          </>
        }
      />
      {(server?.buildType === BuildType.RedisStack || isFromCloud) && (
        <ListGroupItem
          label={
            <Text color="subdued" size="s">
              Port:
              <ColorText
                color="default"
                className={styles.dbInfoListValue}
                data-testid="db-info-port"
              >
                {port}
              </ColorText>
            </Text>
          }
        />
      )}

      {!!db && (
        <ListGroupItem
          label={
            <Text color="subdued" size="s">
              Database Index:
              <ColorText color="default" className={styles.dbInfoListValue}>
                {db}
              </ColorText>
            </Text>
          }
        />
      )}

      {!!modules?.length && (
        <ListGroupItem
          className={styles.dbInfoModulesLabel}
          label={
            <Text color="subdued" size="s">
              Capabilities:
              <ColorText
                color="default"
                className={cx(styles.dbInfoListValue, styles.dbInfoModules)}
              >
                <DatabaseListModules modules={modules} />
              </ColorText>
            </Text>
          }
        />
      )}
    </ListGroup>
  )
}

export default DbInfo
