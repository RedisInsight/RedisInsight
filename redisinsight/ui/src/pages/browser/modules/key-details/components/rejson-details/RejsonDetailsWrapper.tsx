import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { EuiProgress } from '@elastic/eui'

import { isUndefined } from 'lodash'
import { rejsonDataSelector, rejsonSelector } from 'uiSrc/slices/browser/rejson'
import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'

import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { IJSONData } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
import RejsonDetails from './rejson-details/RejsonDetails'

import styles from './styles.module.scss'

export interface Props extends KeyDetailsHeaderProps {}

const RejsonDetailsWrapper = (props: Props) => {
  const keyType = KeyTypes.ReJSON
  const { loading } = useSelector(rejsonSelector)
  const { data, downloaded, type, path } = useSelector(rejsonDataSelector)
  const { name: selectedKey, nameString, length } = useSelector(selectedKeyDataSelector) || {}
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    setExpandedRows(new Set())
  }, [nameString])

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

  const handleJsonKeyExpandAndCollapse = (isExpanded: boolean, path: string) => {
    const matchedPath = path.match(/\[.+?\]/g)
    const levelFromPath = matchedPath ? matchedPath.length - 1 : 0
    if (isExpanded) {
      reportJSONKeyExpanded(levelFromPath)
    } else {
      reportJSONKeyCollapsed(levelFromPath)
    }

    setExpandedRows((rows) => {
      const copyOfSet = new Set(rows)
      if (isExpanded) copyOfSet.add(path)
      else copyOfSet.delete(path)

      return copyOfSet
    })
  }

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
      />
      <div className="key-details-body" key="key-details-body">
        <div className="flex-column" style={{ flex: '1', height: '100%' }}>
          <div
            data-testid="json-details"
            className={styles.container}
          >
            {loading && (
              <EuiProgress
                color="primary"
                size="xs"
                position="absolute"
                data-testid="progress-key-json"
              />
            )}
            {!isUndefined(data) && (
              <RejsonDetails
                selectedKey={selectedKey || stringToBuffer('')}
                dataType={type || ''}
                data={data as IJSONData}
                length={length}
                parentPath={path}
                expadedRows={expandedRows}
                onJsonKeyExpandAndCollapse={handleJsonKeyExpandAndCollapse}
                isDownloaded={downloaded}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { RejsonDetailsWrapper }
