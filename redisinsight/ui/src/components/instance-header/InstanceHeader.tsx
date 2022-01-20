import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { capitalize } from 'lodash'
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'

import DatabaseOverviewWrapper from 'uiSrc/components/database-overview/DatabaseOverviewWrapper'

import { BreadcrumbsLinks, BrowserPageOptions } from 'uiSrc/constants/breadcrumbs'
import { connectedInstanceOverviewSelector, connectedInstanceSelector } from 'uiSrc/slices/instances'
import { CONNECTION_TYPE_DISPLAY } from 'uiSrc/slices/interfaces'
import { getDbIndex } from 'uiSrc/utils'
import PageBreadcrumbs from '../page-breadcrumbs'

import styles from './styles.module.scss'

const InstanceHeader = () => {
  const { name = '', username = '', connectionType = '', db = 0 } = useSelector(connectedInstanceSelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const [windowDimensions, setWindowDimensions] = useState(0)

  useEffect(() => {
    updateWindowDimensions()
    globalThis.addEventListener('resize', updateWindowDimensions)
    return () => {
      globalThis.removeEventListener('resize', updateWindowDimensions)
    }
  }, [])

  const updateWindowDimensions = () => {
    setWindowDimensions(globalThis.innerWidth)
  }

  const getBreadcrumbsInstanceOptions = (): BrowserPageOptions => ({
    connectedInstanceName: name,
    postfix: getDbIndex(db),
    connection: connectionType ? CONNECTION_TYPE_DISPLAY[connectionType] : capitalize(connectionType),
    version,
    user: username || 'Default'
  })

  return (
    <div className={cx(styles.container)}>
      <EuiFlexGroup gutterSize="none" responsive={false}>
        <EuiFlexItem style={{ overflow: 'hidden' }}>
          <div className={styles.breadcrumbsContainer}>
            <PageBreadcrumbs
              breadcrumbs={
                BreadcrumbsLinks.BrowserPage({ ...getBreadcrumbsInstanceOptions() })
              }
            />
          </div>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <DatabaseOverviewWrapper windowDimensions={windowDimensions} />
        </EuiFlexItem>
      </EuiFlexGroup>

    </div>
  )
}

export default InstanceHeader
