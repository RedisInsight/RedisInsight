import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import parse from 'html-react-parser'
import { capitalize } from 'lodash'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPopover } from '@elastic/eui'

import { DatabaseOverview } from 'uiSrc/components'
import { BreadcrumbsLinks, BrowserPageOptions } from 'uiSrc/constants/breadcrumbs'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
  getDatabaseConfigInfoAction
} from 'uiSrc/slices/instances'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { CONNECTION_TYPE_DISPLAY } from 'uiSrc/slices/interfaces'
import { getDbIndex, getModule, truncateText } from 'uiSrc/utils'
import { getOverviewItems } from 'uiSrc/components/database-overview/components/OverviewItems'

import DatabaseListModules from '../database-list-modules/DatabaseListModules'
import PageBreadcrumbs from '../page-breadcrumbs'

import styles from './styles.module.scss'

const maxLengthModules = 6
const middleLengthModules = 3
const minLengthModules = 0

const maxLengthOverview = 5
const minLengthOverview = 3

const widthResponsiveMaxSize = 1300
const widthResponsiveMiddleSize = 1124
const widthResponsiveLowSize = 920

const TIMEOUT_TO_GET_INFO = process.env.NODE_ENV !== 'development' ? 5000 : 100000

const ModulesInfoText = 'More information about Redis modules can be found <a class="link-underline" href="https://redis.io/modules" target="_blank" rel="noreferrer">here</a>.\nCreate a <a class="link-underline" href="https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight" target="_blank" rel="noreferrer">free Redis database</a> with modules support on Redis Cloud.\n'

const InstanceHeader = () => {
  const [lengthModules, setLengthModules] = useState(0)
  const [lengthOverviewItems, setLengthOverviewItems] = useState(5)
  const [isShowMoreInfoPopover, setIsShowMoreInfoPopover] = useState(false)

  const {
    usedMemory,
    totalKeys,
    connectedClients,
    cpuUsagePercentage,
    networkInKbps,
    networkOutKbps,
    opsPerSecond,
    version
  } = useSelector(connectedInstanceOverviewSelector)
  const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
  const { name = '', username = '', connectionType = '', modules = [], db = 0 } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()
  const { theme } = useContext(ThemeContext)
  let interval: NodeJS.Timeout

  const overviewItems = getOverviewItems({
    theme,
    items: {
      usedMemory,
      totalKeys,
      connectedClients,
      cpuUsagePercentage,
      networkInKbps,
      networkOutKbps,
      opsPerSecond
    }
  })

  useEffect(() => {
    updateWindowDimensions()
    globalThis.addEventListener('resize', updateWindowDimensions)
    return () => {
      globalThis.removeEventListener('resize', updateWindowDimensions)
    }
  }, [])

  const getInfo = () => {
    if (document.hidden) return

    dispatch(getDatabaseConfigInfoAction(
      connectedInstanceId,
      () => {},
      () => clearInterval(interval)
    ))
  }

  useEffect(() => {
    interval = setInterval(getInfo, TIMEOUT_TO_GET_INFO)
    return () => clearInterval(interval)
  }, [connectedInstanceId])

  const updateWindowDimensions = () => {
    if (globalThis.innerWidth > widthResponsiveMaxSize) {
      setLengthOverviewItems(maxLengthOverview)
      setLengthModules(maxLengthModules)
      return
    }
    if (globalThis.innerWidth > widthResponsiveMiddleSize) {
      setLengthOverviewItems(maxLengthOverview)
      setLengthModules(middleLengthModules)
      return
    }
    if (globalThis.innerWidth > widthResponsiveLowSize) {
      setLengthOverviewItems(maxLengthOverview)
      setLengthModules(minLengthModules)
      return
    }
    setLengthOverviewItems(minLengthOverview)
    setLengthModules(minLengthModules)
  }

  const getBreadcrumbsInstanceOptions = (): BrowserPageOptions => ({
    connectedInstanceName: name,
    postfix: getDbIndex(db),
    connection: connectionType ? CONNECTION_TYPE_DISPLAY[connectionType] : capitalize(connectionType),
    version,
    user: username || 'Default'
  })

  const getContentOverview = (items: any[], truncateLength = 0) => {
    const moreInfoItems = items.slice(truncateLength)
      .map((overviewItem) => (
        <EuiFlexGroup
          className={styles.moreInfoOverviewItem}
          key={overviewItem.id}
          data-test-subj={overviewItem.id}
          gutterSize="none"
          responsive={false}
          alignItems="center"
        >
          {overviewItem.tooltipIcon && (
            <EuiFlexItem className={styles.moreInfoOverviewIcon} grow={false}>
              <EuiIcon
                size="m"
                type={overviewItem.tooltipIcon}
                className={styles.icon}
              />
            </EuiFlexItem>
          )}
          <EuiFlexItem className={styles.moreInfoOverviewContent} grow={false}>
            { overviewItem.tooltip.content }
          </EuiFlexItem>
          <EuiFlexItem className={styles.moreInfoOverviewTitle} grow={false}>
            { overviewItem.tooltip.title }
          </EuiFlexItem>
        </EuiFlexGroup>
      ))

    return (
      <div className={cx({ [styles.moreInfoOverview]: moreInfoItems.length > 0 })}>
        { moreInfoItems }
      </div>
    )
  }

  const getContentModules = () => {
    const modulesNames = modules?.slice(lengthModules).map(({ name = '', semanticVersion = '', version = '' }) => (
      <div key={name} className={cx(styles.mi_moduleName)}>
        {`${truncateText(getModule(name)?.name ?? name, 50)} `}
        {!!(semanticVersion || version) && (
          <span className={styles.mi_version}>
            v.
            {' '}
            {semanticVersion || version}
          </span>
        )}
      </div>
    ))

    return (
      <>
        <h4 className={styles.mi_fieldName}>Modules:</h4>
        <p className={styles.mi_smallText}>{parse(ModulesInfoText)}</p>
        {modulesNames ?? null}
      </>
    )
  }

  const MoreInfo = () => (
    <EuiPopover
      ownFocus={false}
      anchorPosition="downCenter"
      isOpen={isShowMoreInfoPopover}
      closePopover={() => setIsShowMoreInfoPopover(false)}
      anchorClassName={styles.moreInfo}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.mi_wrapper)}
      button={(
        <EuiButtonIcon
          iconType="boxesVertical"
          onClick={() => setIsShowMoreInfoPopover((isOpenPopover) => !isOpenPopover)}
          aria-labelledby="more info"
        />
        )}
    >
      <>
        {getContentOverview(overviewItems, lengthOverviewItems)}
        {getContentModules()}
      </>
    </EuiPopover>
  )

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
          <EuiFlexGroup gutterSize="none" responsive={false}>
            <EuiFlexItem key="overview">
              <div className={cx('flex-row', styles.itemContainer, styles.overview)}>
                <DatabaseOverview
                  maxLength={lengthOverviewItems}
                  items={overviewItems}
                />
              </div>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ flexShrink: 0 }}>
              <div className={cx('flex-row', styles.itemContainer, styles.modules, { [styles.noModules]: !modules?.length })}>
                {!!modules?.length && (
                  <DatabaseListModules dark inCircle maxLength={lengthModules} modules={modules} />
                )}
                {MoreInfo()}
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>

    </div>
  )
}

export default InstanceHeader
