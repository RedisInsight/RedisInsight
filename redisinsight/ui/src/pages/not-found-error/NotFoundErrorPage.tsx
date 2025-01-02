import React, { useCallback } from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText, EuiTitle } from '@elastic/eui'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { getConfig } from 'uiSrc/config'
import Logo from 'uiSrc/assets/img/logo.svg?react'
import Robot from 'uiSrc/assets/img/robot.svg?react'
import styles from './styles.module.scss'

const NotFoundErrorPage = () => {
  const history = useHistory()
  const config = getConfig()
  const {
    [FeatureFlags.envDependent]: envDependentFeature
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const onDbButtonClick = useCallback(() => {
    if (envDependentFeature?.flag) {
      history.push('/')
    } else {
      window.location.href = `${config.app.activityMonitorOrigin}/#/databases`
    }
  }, [envDependentFeature, config])

  return (
    <div className={styles.notfoundpage}>
      <EuiFlexGroup
        direction="column"
        alignItems="flexStart"
        gutterSize="none"
        className={styles.notfoundgroup}
      >
        <EuiFlexItem>
          <EuiFlexGroup
            direction="column"
            alignItems="flexStart"
            gutterSize="xl"
          >
            <EuiFlexItem>
              <EuiIcon
                className={styles.logoIcon}
                size="original"
                type={Logo}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiTitle>
                <h1>Whoops!<br />This Page Is an Empty Set</h1>
              </EuiTitle>
              <EuiText>
                <p className={styles.errorSubtext} style={{ marginBottom: '.8rem' }}>
                  We searched every shard, <br />But couldn&apos;t find the page you&apos;re after.
                </p>
                <EuiButton
                  color="secondary"
                  fill
                  size="s"
                  onClick={onDbButtonClick}
                  data-testid="not-found-db-list-button"
                >
                  Databases page
                </EuiButton>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <div className={styles.robotHolder}>
        <Robot className={styles.robot} />
      </div>
    </div>
  )
}

export default NotFoundErrorPage
