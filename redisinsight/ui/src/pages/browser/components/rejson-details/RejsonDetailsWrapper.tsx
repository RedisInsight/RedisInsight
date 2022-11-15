import React from 'react'
import { useSelector } from 'react-redux'
import { EuiProgress } from '@elastic/eui'

import { rejsonDataSelector, rejsonSelector } from 'uiSrc/slices/browser/rejson'
import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'

import RejsonDetails from './RejsonDetails/RejsonDetails'

import styles from './styles.module.scss'

const RejsonDetailsWrapper = () => {
  const { loading } = useSelector(rejsonSelector)
  const { data, downloaded, type } = useSelector(rejsonDataSelector)
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

  const reportJSONKeyExpandAndCollapse = (isExpanded: boolean, path: string) => {
    const matchedPath = path.match(/\[.+?\]/g)
    const levelFromPath = matchedPath ? matchedPath.length - 1 : 0
    if (isExpanded) {
      reportJSONKeyExpanded(levelFromPath)
    } else {
      reportJSONKeyCollapsed(levelFromPath)
    }
  }

  const reportJSONPropertyEdited = () => {}

  const reportJSONPropertyDeleted = () => {}

  const reportJSONPropertyAdded = () => {}

  return (
    <div className={`${[styles.container].join(' ')}`}>
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
          dbNumber={0}
          dataType={type || ''}
          deleteMsg=""
          instanceId={123}
          resultTableKeyMap={{}}
          handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
          onJSONPropertyDeleted={reportJSONPropertyDeleted}
          data={data}
          onJSONKeyExpandAndCollapse={reportJSONKeyExpandAndCollapse}
          onJSONPropertyAdded={reportJSONPropertyAdded}
          onJSONPropertyEdited={reportJSONPropertyEdited}
          shouldRejsonDataBeDownloaded={!downloaded}
          handleSubmitUpdateValue={handleEditValueUpdate}
          handleDeleteKeyDialogOpen={() => {}}
          handleOpenExpiryDialog={() => {}}
          keyProperty={{}}
        />
      )}
    </div>
  )
}

export default RejsonDetailsWrapper
