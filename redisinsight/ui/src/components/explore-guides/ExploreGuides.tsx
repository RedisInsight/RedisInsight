import React from 'react'
import { EuiIcon, EuiText, EuiTitle, EuiSpacer } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { guideLinksSelector } from 'uiSrc/slices/content/guide-links'

import GUIDE_ICONS from 'uiSrc/components/explore-guides/icons'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { keysSelector } from 'uiSrc/slices/browser/keys'

import { openTutorialByPath } from 'uiSrc/slices/panels/insights'
import { findTutorialPath } from 'uiSrc/utils'
import styles from './styles.module.scss'

const ExploreGuides = () => {
  const { data } = useSelector(guideLinksSelector)
  const { provider } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const history = useHistory()
  const dispatch = useDispatch()

  const handleLinkClick = (tutorialId: string, title: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_TUTORIAL_CLICKED,
      eventData: {
        databaseId: instanceId,
        guideName: title,
        provider,
        viewType
      }
    })

    const tutorialPath = findTutorialPath({ id: tutorialId ?? '' })
    dispatch(openTutorialByPath(tutorialPath ?? '', history))
  }

  return (
    <div data-testid="explore-guides">
      <EuiTitle size="xs">
        <span>Here&apos;s a good starting point</span>
      </EuiTitle>
      <EuiText>Explore the amazing world of Redis Stack with our interactive guides</EuiText>
      <EuiSpacer size="xl" />
      {!!data.length && (
        <div className={styles.guides}>
          {data.map(({ title, tutorialId, icon }) => (
            <div
              key={title}
              role="button"
              tabIndex={0}
              onKeyDown={() => {}}
              onClick={() => handleLinkClick(tutorialId, title)}
              className={styles.btn}
              data-testid={`guide-button-${title}`}
            >
              {icon in GUIDE_ICONS && (
                <EuiIcon
                  className={styles.icon}
                  type={GUIDE_ICONS[icon]}
                  data-testid={`guide-icon-${icon}`}
                />
              )}
              {title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExploreGuides
