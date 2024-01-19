import React from 'react'

import { EuiIcon, EuiText, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import ClickLearnRocketIcon from 'uiSrc/assets/img/click-learn-rocket.svg'

import { openTutorialByPath } from 'uiSrc/slices/panels/insights'
import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'
import { capabilities } from './constants'
import styles from './styles.module.scss'

export interface Props {
  mode?: 'reduced' | 'wide'
  wrapperClassName?: string
}

const CapabilityPromotion = (props: Props) => {
  const { mode = 'wide', wrapperClassName } = props

  const dispatch = useDispatch()
  const history = useHistory()

  const onClickTutorial = (id: string) => {
    dispatch(openTutorialByPath(id, history))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: TELEMETRY_EMPTY_VALUE,
        source: 'home page',
        tutorialId: id
      },
    })
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
        {capabilities.map(({ title, id, icon }) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <div
            key={id}
            tabIndex={0}
            role="button"
            onClick={() => onClickTutorial(id)}
            className={styles.guideItem}
            data-testid={`capability-promotion-${id}`}
          >
            <EuiIcon type={icon} className={styles.guideIcon} />
            <EuiText>{title}</EuiText>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CapabilityPromotion
