import React, { useMemo, useRef, useEffect, useState } from 'react'
import {
  EuiFlyoutHeader,
  EuiText,
  EuiButtonEmpty,
  EuiLoadingContent,
  EuiHorizontalRule,
  EuiPopover,
} from '@elastic/eui'
import JsxParser from 'react-jsx-parser'
import cx from 'classnames'
import { debounce } from 'lodash'
import { useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { ExternalLink } from 'uiSrc/components'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { getTutorialCapability, Nullable } from 'uiSrc/utils'

import { ReactComponent as RocketIcon } from 'uiSrc/assets/img/icons/rocket.svg'
import { appContextCapability } from 'uiSrc/slices/app/context'
import { isShowCapabilityTutorialPopover, setCapabilityPopoverShown } from 'uiSrc/services'
import { connectedInstanceCDSelector } from 'uiSrc/slices/instances/instances'
import './styles/main.scss'
import { getTutorialSection } from '../../utils'
import {
  Image,
  Code,
  EmptyPrompt,
  RedisUploadButton,
  CloudLink,
  Pagination,
  RedisInsightLink,
} from '..'
import styles from './styles.module.scss'

export interface Props {
  onClose: () => void
  title: string
  backTitle: string
  content: string
  isLoading?: boolean
  error?: string
  scrollTop?: number
  onScroll?: (top: number) => void
  activeKey?: Nullable<string>
  path: string
  manifestPath?: Nullable<string>
  sourcePath: string
  pagination?: IEnablementAreaItem[]
}
const InternalPage = (props: Props) => {
  const location = useLocation()
  const {
    onClose,
    title,
    backTitle,
    isLoading,
    error,
    content,
    onScroll,
    scrollTop,
    pagination,
    activeKey,
    path,
    manifestPath,
    sourcePath,
  } = props
  const components: any = { Image, Code, RedisUploadButton, CloudLink, RedisInsightLink, ExternalLink }
  const containerRef = useRef<HTMLDivElement>(null)
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { source } = useSelector(appContextCapability)
  const { free = false } = useSelector(connectedInstanceCDSelector) ?? {}
  const [showCapabilityPopover, setShowCapabilityPopover] = useState(false)
  const tutorialCapability = getTutorialCapability(source!)

  const handleScroll = debounce(() => {
    if (containerRef.current && onScroll) {
      onScroll(containerRef.current.scrollTop)
    }
  }, 500)

  const sendEventClickExternalLinkTelemetry = (link: string = '') => {
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_LINK_CLICKED,
      eventData: {
        path,
        link,
        section: getTutorialSection(manifestPath),
        databaseId: instanceId,
      }
    })
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement

    // send telemetry event after click on an external link
    if (target?.getAttribute('href') && target?.getAttribute('target')) {
      sendEventClickExternalLinkTelemetry(target?.innerText)
    }
  }

  useEffect(() => {
    if (isShowCapabilityTutorialPopover(free) && !!tutorialCapability?.path) {
      setShowCapabilityPopover(true)
      setCapabilityPopoverShown()
      sendEventTelemetry({
        event: TelemetryEvent.CAPABILITY_POPOVER_DISPLAYED,
        eventData: {
          capabilityName: tutorialCapability.telemetryName,
          databaseId: instanceId,
        }
      })
    }
  }, [free])

  useEffect(() => {
    if (!isLoading && !error && containerRef.current) {
      if (location?.hash) {
        const target = containerRef.current?.querySelector(location.hash) as HTMLElement
        if (target) {
          // HACK: force scroll to element for electron app
          target.setAttribute('tabindex', '-1')
          target?.focus()
          return
        }
      }

      if (scrollTop && containerRef.current?.scrollTop === 0) {
        requestAnimationFrame(() => setTimeout(() => {
          containerRef.current?.scroll(0, scrollTop)
        }, 0))
      }
    }
  }, [isLoading, location])

  const contentComponent = useMemo(() => (
    // @ts-ignore
    <JsxParser
      bindings={{ path }}
      components={components}
      blacklistedTags={['iframe', 'script']}
      autoCloseVoidElements
      jsx={content}
      onError={(e) => console.error(e)}
    />
  ), [content])

  return (
    <div className={styles.container} data-test-subj="internal-page">
      <EuiFlyoutHeader className={styles.header}>
        <div style={{ padding: 0 }}>
          <EuiPopover
            initialFocus={false}
            panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
            anchorClassName={styles.popoverAnchor}
            anchorPosition="leftCenter"
            isOpen={showCapabilityPopover}
            panelPaddingSize="m"
            closePopover={() => setShowCapabilityPopover(false)}
            button={(
              <EuiButtonEmpty
                data-testid="enablement-area__page-close"
                iconType="arrowLeft"
                onClick={onClose}
                className={styles.backButton}
                aria-label="Back"
              >
                {backTitle}
              </EuiButtonEmpty>
            )}
          >
            <div data-testid="explore-capability-popover">
              <RocketIcon className={styles.rocketIcon} />
              <EuiText className={styles.popoverTitle}>Explore Redis</EuiText>
              <EuiText className={styles.popoverText}>
                {'You expressed interest in learning about the '}
                <b>{tutorialCapability?.name}</b>
                . Try this tutorial to get started.
              </EuiText>
            </div>
          </EuiPopover>
        </div>
        <div>
          <EuiHorizontalRule margin="xs" />
        </div>
        <div>
          <EuiText className={styles.pageTitle} color="default">{title?.toUpperCase()}</EuiText>
        </div>
      </EuiFlyoutHeader>
      <div
        ref={containerRef}
        className={cx(styles.content, 'enablement-area__page')}
        onScroll={handleScroll}
        onClick={handleClick}
        role="none"
        data-testid="enablement-area__page"
      >
        { isLoading && <EuiLoadingContent data-testid="enablement-area__page-loader" lines={3} /> }
        { !isLoading && error && <EmptyPrompt /> }
        { !isLoading && !error && contentComponent }
      </div>
      {!!pagination?.length && (
        <>
          <div className={styles.footer}>
            <Pagination sourcePath={sourcePath} items={pagination} activePageKey={activeKey} />
          </div>
        </>
      )}
    </div>
  )
}

export default InternalPage
