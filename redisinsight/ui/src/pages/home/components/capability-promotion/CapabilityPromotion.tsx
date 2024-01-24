import React from 'react'

import { EuiIcon, EuiText, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import ClickLearnRocketIcon from 'uiSrc/assets/img/click-learn-rocket.svg'

import { openTutorialByPath } from 'uiSrc/slices/panels/insights'
import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'
import { guideLinksSelector } from 'uiSrc/slices/content/guide-links'
import GUIDE_ICONS from 'uiSrc/components/explore-guides/icons'
import { findTutorialPath } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  mode?: 'reduced' | 'wide'
  wrapperClassName?: string
}

const CapabilityPromotion = (props: Props) => {
  const { mode = 'wide', wrapperClassName } = props
  const { data } = useSelector(guideLinksSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  const onClickTutorial = (id: string) => {
    const tutorialPath = findTutorialPath({ id: id ?? '' })
    dispatch(openTutorialByPath(tutorialPath ?? '', history))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: TELEMETRY_EMPTY_VALUE,
        source: 'home page',
        tutorialId: id
      },
    })
  }

  if (!data?.length) {
    return null
  }

  return (
    <div className={cx(styles.wrapper, mode, wrapperClassName)} data-testid="capability-promotion">
      <img
        className={styles.img}
        src={ClickLearnRocketIcon}
        alt="click and learn"
      />
      <EuiTitle size="s" className={styles.title}>
        <span>Click & Learn</span>
      </EuiTitle>
      <div className={styles.guides}>
        {data.map(({ title, tutorialId, icon }) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <div
            key={tutorialId}
            tabIndex={0}
            role="button"
            onClick={() => onClickTutorial(tutorialId)}
            className={styles.guideItem}
            data-testid={`capability-promotion-${tutorialId}`}
          >
            {icon in GUIDE_ICONS && (
              <EuiIcon
                className={styles.guideIcon}
                type={GUIDE_ICONS[icon]}
                data-testid={`guide-icon-${icon}`}
              />
            )}
            <EuiText>{title}</EuiText>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CapabilityPromotion
