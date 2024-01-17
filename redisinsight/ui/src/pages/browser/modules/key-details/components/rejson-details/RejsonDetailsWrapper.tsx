import React from 'react'
import { useSelector } from 'react-redux'
import { EuiProgress } from '@elastic/eui'

import { rejsonDataSelector, rejsonSelector } from 'uiSrc/slices/browser/rejson'
import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'

import { KeyTypes } from 'uiSrc/constants'
import RejsonDetails from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/rejson-details/RejsonDetails'

import styles from './styles.module.scss'

export interface Props extends KeyDetailsHeaderProps {}

const RejsonDetailsWrapper = (props: Props) => {
  const keyType = KeyTypes.ReJSON
  const { loading } = useSelector(rejsonSelector)
  const { data, downloaded, type, path } = useSelector(rejsonDataSelector)
  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) || {}
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const handleSubmitJsonUpdateValue = async () => {}

  const handleEditValueUpdate = () => {}

  const reportJSONKeyCollapsed = (level: number) => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_JSON_KEY_COLLAPSED,
        TelemetryEvent.TREE_VIEW_JSON_KEY_COLLAPSED
      ),
      eventData: {
        databaseId: instanceId,
        level
      }
    })
  }

  const reportJSONKeyExpanded = (level: number) => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_JSON_KEY_EXPANDED,
        TelemetryEvent.TREE_VIEW_JSON_KEY_EXPANDED
      ),
      eventData: {
        databaseId: instanceId,
        level
      }
    })
  }

  const reportJsonKeyExpandAndCollapse = (isExpanded: boolean, path: string) => {
    const matchedPath = path.match(/\[.+?\]/g)
    const levelFromPath = matchedPath ? matchedPath.length - 1 : 0
    if (isExpanded) {
      reportJSONKeyExpanded(levelFromPath)
    } else {
      reportJSONKeyCollapsed(levelFromPath)
    }
  }

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
      />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <div
              data-testid="json-details"
              className={`${[styles.container].join(' ')}`}
            >
              {loading && (
                <EuiProgress
                  color="primary"
                  size="xs"
                  position="absolute"
                  data-testid="progress-key-json"
                />
              )}
              {!(loading && data === undefined) && (
                <RejsonDetails
                  selectedKey={selectedKey}
                  dataType={type || ''}
                  data={data}
                  parentPath={path}
                  onJsonKeyExpandAndCollapse={reportJsonKeyExpandAndCollapse}
                  shouldRejsonDataBeDownloaded={!downloaded}
                  handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                  handleSubmitUpdateValue={handleEditValueUpdate}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { RejsonDetailsWrapper }
