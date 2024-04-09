import React from 'react'
import { EuiButtonEmpty, EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import cx from 'classnames'
import { Pages } from 'uiSrc/constants'
import { resetDataRedisCloud } from 'uiSrc/slices/instances/cloud'
import { resetDataRedisCluster } from 'uiSrc/slices/instances/cluster'
import { resetDataSentinel } from 'uiSrc/slices/instances/sentinel'

import { ReactComponent as Logo } from 'uiSrc/assets/img/logo.svg'

import styles from './PageHeader.module.scss'

interface Props {
  title: string
  subtitle?: string
  children?: React.ReactNode
  logo?: React.ReactNode
  className?: string
}

const PageHeader = (props: Props) => {
  const { title, subtitle, logo, children, className } = props
  const history = useHistory()
  const dispatch = useDispatch()

  const resetConnections = () => {
    dispatch(resetDataRedisCluster())
    dispatch(resetDataRedisCloud())
    dispatch(resetDataSentinel())
  }

  const goHome = () => {
    resetConnections()
    history.push(Pages.home)
  }

  return (
    <div className={cx(styles.pageHeader, className)}>
      <div className={styles.pageHeaderTop}>
        <div>
          <EuiTitle size="s" className={styles.title} data-testid="page-title">
            <h1>
              <b>{title}</b>
            </h1>
          </EuiTitle>
          {subtitle ? <span data-testid="page-subtitle">{subtitle}</span> : ''}
        </div>
        {logo || (
          <div className={styles.pageHeaderLogo}>
            <EuiButtonEmpty
              aria-label="redisinsight"
              onClick={goHome}
              onKeyDown={goHome}
              className={styles.logo}
              tabIndex={0}
              iconType={Logo}
              data-testid="redis-logo-home"
            />
          </div>
        )}
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
