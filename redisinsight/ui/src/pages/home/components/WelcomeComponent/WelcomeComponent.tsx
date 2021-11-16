import { EuiText, EuiTitle } from '@elastic/eui'
import React, { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'

import { Theme } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import darkLogo from 'uiSrc/assets/img/dark_logo.svg'
import lightLogo from 'uiSrc/assets/img/light_logo.svg'
import AddInstanceControls, {
  Direction,
} from '../AddInstanceControls/AddInstanceControls'

import styles from './styles.module.scss'

export interface Props {
  onAddInstance: () => void;
}

const Welcome = ({ onAddInstance }: Props) => {
  const title = 'Welcome to RedisInsight'
  const underTitle = 'Thanks for choosing RedisInsight to interact with your Redis databases.'

  const subTitle = 'Connect to your Redis Databases'
  const underSubTitle = 'In order to use RedisInsight, you will need to connect your Redis databases. '
    + 'If you don’t have one available, follow the guides to get started with Redis.'

  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const themeContext = useContext(ThemeContext)

  setTitle('Welcome to RedisInsight')

  useEffect(() => {
    if (analyticsIdentified) {
      sendPageViewTelemetry({
        name: TelemetryPageView.WELCOME_PAGE
      })
    }
  }, [analyticsIdentified])

  return (
    <div
      className={cx(
        styles.welcome,
        themeContext.theme === Theme.Dark
          ? styles.welcome_dark
          : styles.welcome_light
      )}
    >
      <div className={styles.content}>
        <img
          alt="logo"
          className={styles.logo}
          src={themeContext.theme === Theme.Dark ? darkLogo : lightLogo}
          height="28"
        />

        <EuiTitle size="m" className={styles.title} data-testid="welcome-page-title">
          <h4>{title}</h4>
        </EuiTitle>
        <EuiText className={styles.text}>{underTitle}</EuiText>
        <EuiTitle size="s" className={styles.subTitle}>
          <h4>{subTitle}</h4>
        </EuiTitle>
        <EuiText className={styles.text}>{underSubTitle}</EuiText>

        <div className={styles.controls}>
          <AddInstanceControls
            onAddInstance={onAddInstance}
            direction={Direction.column}
          />
        </div>
      </div>
    </div>
  )
}

export default Welcome
