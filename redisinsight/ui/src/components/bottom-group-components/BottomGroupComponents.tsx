import React from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import CliWrapper from 'uiSrc/components/cli/CliWrapper'
import CommandHelperWrapper from 'uiSrc/components/command-helper/CommandHelperWrapper'
import { MonitorWrapper } from 'uiSrc/components'
import { monitorSelector } from 'uiSrc/slices/cli/monitor'
import BottomGroupMinimized from './components/bottom-group-minimized/BottomGroupMinimized'

import styles from './styles.module.scss'

const BottomGroupComponents = () => {
  const { isShowCli, isShowHelper } = useSelector(cliSettingsSelector)
  const { isShowMonitor } = useSelector(monitorSelector)

  return (
    <div className={styles.groupComponentsWrapper}>
      <div className={styles.groupComponents}>
        {isShowCli && <CliWrapper />}
        {isShowHelper && (
          <div
            className={cx(styles.helperWrapper, {
              [styles.fullWidth]: !isShowCli,
            })}
          >
            <CommandHelperWrapper />
          </div>
        )}
        {isShowMonitor && (
          <div
            className={cx(styles.monitorWrapper, {
              [styles.fullWidth]: !isShowCli,
            })}
          >
            <MonitorWrapper />
          </div>
        )}
      </div>
      <BottomGroupMinimized />
    </div>
  )
}

export default BottomGroupComponents
