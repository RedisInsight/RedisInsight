import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'

import { useParams } from 'react-router-dom'
import {
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { FeatureFlags, KeyTypes } from 'uiSrc/constants'

import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import AddHashFields from './add-hash-fields/AddHashFields'
import { HashDetailsTable } from './hash-details-table'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const HashDetails = (props: Props) => {
  const keyType = KeyTypes.Hash
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const { loading } = useSelector(selectedKeySelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const { instanceId } = useParams<{ instanceId: string }>()
  const {
    [FeatureFlags.hashFieldExpiration]: hashFieldExpirationFeature
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)
  const [showTtl, setShowTtl] = useState<boolean>(true)

  const isExpireFieldsAvailable = hashFieldExpirationFeature?.flag
    && isVersionHigherOrEquals(version, CommandsVersions.HASH_TTL.since)
    && showTtl

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    setIsAddItemPanelOpen(false)
    if (isCancelled) {
      onCloseAddItemPanel()
    }
  }

  const handleSelectShow = (show: boolean) => {
    setShowTtl(show)

    sendEventTelemetry({
      event: TelemetryEvent.SHOW_HASH_TTL_CLICKED,
      eventData: {
        databaseId: instanceId,
        action: show ? 'show' : 'hide'
      }
    })
  }

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
        displayKeyFormatter={false}
      />
      <KeyDetailsSubheader
        showTtl={showTtl}
        onShowTtl={handleSelectShow}
        onAddKey={openAddItemPanel}
      />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <HashDetailsTable isExpireFieldsAvailable={isExpireFieldsAvailable} onRemoveKey={onRemoveKey} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            <AddHashFields isExpireFieldsAvailable={isExpireFieldsAvailable} closePanel={closeAddItemPanel} />
          </div>
        )}
      </div>
    </div>
  )
}

export { HashDetails }
