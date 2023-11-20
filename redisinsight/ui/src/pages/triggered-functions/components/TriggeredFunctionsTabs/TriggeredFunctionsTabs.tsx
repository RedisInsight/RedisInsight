import React, { useCallback } from 'react'
import { EuiTab, EuiTabs } from '@elastic/eui'
import { useHistory, useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { triggeredFunctionsViewTabs, TriggeredFunctionsViewTabs } from 'uiSrc/pages/triggered-functions/constants'

export interface Props {
  path: string
}

const TriggeredFunctionsTabs = ({ path }: Props) => {
  const history = useHistory()

  const { instanceId } = useParams<{ instanceId: string }>()

  const onSelectedTabChanged = (id: TriggeredFunctionsViewTabs) => {
    if (id === TriggeredFunctionsViewTabs.Libraries) {
      history.push(Pages.triggeredFunctionsLibraries(instanceId))
      sendEventTelemetry({
        event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARIES_CLICKED,
        eventData: {
          databaseId: instanceId
        }
      })
    }
    if (id === TriggeredFunctionsViewTabs.Functions) {
      history.push(Pages.triggeredFunctionsFunctions(instanceId))
      sendEventTelemetry({
        event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTIONS_CLICKED,
        eventData: {
          databaseId: instanceId
        }
      })
    }
  }

  const renderTabs = useCallback(() => triggeredFunctionsViewTabs.map(({ id, label }) => (
    <EuiTab
      isSelected={path === id}
      onClick={() => onSelectedTabChanged(id)}
      key={id}
      data-testid={`triggered-functions-tab-${id}`}
    >
      {label}
    </EuiTab>
  )), [path])

  return (
    <>
      <EuiTabs className="tabs-active-borders" data-testid="triggered-functions-tabs">{renderTabs()}</EuiTabs>
    </>
  )
}

export default TriggeredFunctionsTabs
