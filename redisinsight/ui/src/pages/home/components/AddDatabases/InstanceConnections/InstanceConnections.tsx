import React, { useContext } from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from '@elastic/eui'
import cx from 'classnames'

import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import ActiveManualSvg from 'uiSrc/assets/img/active_manual.svg'
import NotActiveManualSvg from 'uiSrc/assets/img/not_active_manual.svg'
import ActiveAutoSvg from 'uiSrc/assets/img/active_auto.svg'
import NotActiveAutoSvg from 'uiSrc/assets/img/not_active_auto.svg'
import LightActiveManualSvg from 'uiSrc/assets/img/light_theme/active_manual.svg'
import LightNotActiveManualSvg from 'uiSrc/assets/img/light_theme/n_active_manual.svg'
import LightActiveAutoSvg from 'uiSrc/assets/img/light_theme/active_auto.svg'
import LightNotActiveAutoSvg from 'uiSrc/assets/img/light_theme/n_active_auto.svg'

import { AddDbType } from '../AddDatabasesContainer'

import styles from '../styles.module.scss'

export interface Props {
  connectionType: AddDbType,
  changeConnectionType: (connectionType: AddDbType) => void,
  isFullWidth: boolean
}

const InstanceConnections = React.memo((props: Props) => {
  const { connectionType, changeConnectionType, isFullWidth } = props
  const { theme } = useContext(ThemeContext)

  const AddDatabaseManually = () => (
    <div className={cx(styles.connectionTypeTitle, { [styles.connectionTypeTitleFullWidth]: isFullWidth })}>
      Add Database Manually
    </div>
  )

  const AutoDiscoverDatabase = () => (
    <div className={cx(styles.connectionTypeTitle, { [styles.connectionTypeTitleFullWidth]: isFullWidth })}>
      Autodiscover Databases
    </div>
  )

  const getProperManualImage = () => {
    if (theme === Theme.Dark) {
      return connectionType === AddDbType.manual ? ActiveManualSvg : NotActiveManualSvg
    }
    return connectionType === AddDbType.manual ? LightActiveManualSvg : LightNotActiveManualSvg
  }

  const getProperAutoImage = () => {
    if (theme === Theme.Dark) {
      return connectionType === AddDbType.auto ? ActiveAutoSvg : NotActiveAutoSvg
    }
    return connectionType === AddDbType.auto ? LightActiveAutoSvg : LightNotActiveAutoSvg
  }

  return (
    <div className={styles.connectionTypesContainer}>
      <EuiFlexGroup>
        <EuiFlexItem
          className={
            cx(
              styles.connectionType,
              connectionType === AddDbType.manual ? styles.selectedConnectionType : ''
            )
          }
          onClick={() => changeConnectionType(AddDbType.manual)}
          grow={1}
          data-testid="add-manual"
        >
          <EuiFlexGroup
            alignItems="center"
            gutterSize="m"
            direction={isFullWidth ? 'row' : 'column'}
          >
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="m" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiIcon
                    className={styles.connectionIcon}
                    type={getProperManualImage()}
                  />
                </EuiFlexItem>
                {!isFullWidth && (
                  <EuiFlexItem>
                    <AddDatabaseManually />
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              {isFullWidth && (<AddDatabaseManually />)}
              <EuiText
                color="subdued"
                size="s"
                className={cx({ [styles.descriptionNotFullWidth]: !isFullWidth })}
              >
                Use Host and Port to connect to your Redis Database
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem
          className={
            cx(
              styles.connectionType,
              connectionType === AddDbType.auto ? styles.selectedConnectionType : ''
            )
          }
          onClick={() => changeConnectionType(AddDbType.auto)}
          grow={1}
          data-testid="add-auto"
        >
          <EuiFlexGroup
            alignItems="center"
            gutterSize="m"
            direction={isFullWidth ? 'row' : 'column'}
          >
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="m" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiIcon
                    className={styles.connectionIcon}
                    type={getProperAutoImage()}
                  />
                </EuiFlexItem>
                {!isFullWidth && (
                  <EuiFlexItem>
                    <AutoDiscoverDatabase />
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              {isFullWidth && (<AutoDiscoverDatabase />)}
              <EuiText
                color="subdued"
                size="s"
                className={cx({ [styles.descriptionNotFullWidth]: !isFullWidth })}
              >
                Use discovery tools to automatically discover and add your Redis Databases
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
})

export default InstanceConnections
