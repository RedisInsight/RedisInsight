import React from 'react'

import { EuiLink, EuiText } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { findTutorialPath } from 'uiSrc/utils'
import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

export interface Props {
  tutorials: Array<{
    id: string
    title: string
  }>
  source: string
}

const QueryTutorials = ({ tutorials, source }: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleClickTutorial = (id: string) => {
    const tutorialPath = findTutorialPath({ id })
    dispatch(openTutorialByPath(tutorialPath, history, true))

    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
      eventData: {
        path: tutorialPath,
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
        source,
      }
    })
  }

  return (
    <div className={styles.container}>
      <EuiText className={styles.title}>
        Tutorials:
      </EuiText>
      {tutorials.map(({ id, title }) => (
        <EuiLink
          role="button"
          key={id}
          className={styles.tutorialLink}
          onClick={() => handleClickTutorial(id)}
          data-testid={`query-tutorials-link_${id}`}
        >
          {title}
        </EuiLink>
      ))}
    </div>
  )
}

export default QueryTutorials
