import React from 'react'
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui'
import { useSelector } from 'react-redux'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { instancesSelector } from 'uiSrc/slices/instances/instances'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import SearchDatabasesList from '../search-databases-list'

import styles from './styles.module.scss'

export interface Props {
  onAddInstance: () => void
}

const DatabaseListHeader = ({ onAddInstance }: Props) => {
  const { data: instances } = useSelector(instancesSelector)

  const handleOnAddDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CLICKED,
      eventData: {
        source: OAuthSocialSource.DatabasesList,
      }
    })
    onAddInstance()
  }

  const AddInstanceBtn = () => (
    <EuiButton
      fill
      size="s"
      color="secondary"
      onClick={handleOnAddDatabase}
      className={styles.addInstanceBtn}
      data-testid="add-redis-database-short"
    >
      <span>+ DB</span>
    </EuiButton>
  )

  return (
    <div className={styles.containerDl}>
      <EuiFlexGroup className={styles.contentDL} alignItems="center" responsive={false} gutterSize="s">
        <EuiFlexItem grow={false}>
          <AddInstanceBtn />
        </EuiFlexItem>
        {instances.length > 0 && (
          <EuiFlexItem grow={false} className={styles.searchContainer}>
            <SearchDatabasesList />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      <EuiSpacer className={styles.spacerDl} />
    </div>
  )
}

export default DatabaseListHeader
