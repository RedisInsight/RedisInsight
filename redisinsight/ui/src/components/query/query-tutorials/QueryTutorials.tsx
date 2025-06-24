import React from 'react'

import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { findTutorialPath } from 'uiSrc/utils'
import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'

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
      },
    })
  }

  return (
    <div className={styles.container}>
      <Text className={styles.title}>Tutorials:</Text>
      {tutorials.map(({ id, title }) => (
        <Link
          role="button"
          key={id}
          className={styles.tutorialLink}
          onClick={() => handleClickTutorial(id)}
          data-testid={`query-tutorials-link_${id}`}
        >
          {title}
        </Link>
      ))}
    </div>
  )
}

export default QueryTutorials
