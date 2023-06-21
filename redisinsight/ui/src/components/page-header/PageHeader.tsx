/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react'
import { EuiButtonEmpty, EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'

import { Theme, Pages } from 'uiSrc/constants'
import { resetDataRedisCloud } from 'uiSrc/slices/instances/cloud'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { resetDataRedisCluster } from 'uiSrc/slices/instances/cluster'
import { resetDataSentinel } from 'uiSrc/slices/instances/sentinel'

import { ipcAuthGithub, ipcAuthGoogle } from 'uiSrc/electron/utils'
import styles from './PageHeader.module.scss'

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, children }: Props) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { theme } = useContext(ThemeContext)

  const resetConnections = () => {
    dispatch(resetDataRedisCluster())
    dispatch(resetDataRedisCloud())
    dispatch(resetDataSentinel())
  }

  const goHome = () => {
    resetConnections()
    history.push(Pages.home)
  }

  const authGoogle = () => {
    ipcAuthGoogle()
  }

  const authGithub = () => {
    ipcAuthGithub()
  }

  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderTop}>
        <div>
          <EuiTitle size="s" className={styles.title}>
            <h1>
              <b>{title}</b>
            </h1>
          </EuiTitle>
          {subtitle ? <span>{subtitle}</span> : ''}
        </div>
        <div className={styles.pageHeaderLogo}>
          <EuiButtonEmpty
            aria-label="auth google"
            onClick={authGoogle}
            onKeyDown={authGoogle}
            className={cx(styles.logo, styles.google)}
            tabIndex={0}
          />
          <EuiButtonEmpty
            aria-label="auth github"
            onClick={authGithub}
            onKeyDown={authGithub}
            className={cx(styles.logo, styles.github)}
            tabIndex={0}
          />
        </div>
      </div>
      {children ? <div>{children}</div> : ''}
    </div>
  )
}

PageHeader.defaultProps = {
  subtitle: null,
  children: null,
}

export default PageHeader
