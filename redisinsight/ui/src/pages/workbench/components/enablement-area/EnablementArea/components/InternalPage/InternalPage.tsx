import React, { useMemo, useRef, useEffect } from 'react'
import {
  EuiFlyoutHeader,
  EuiText,
  EuiButtonEmpty,
  EuiLoadingContent,
  EuiHorizontalRule,
} from '@elastic/eui'
import JsxParser from 'react-jsx-parser'
import cx from 'classnames'
import { debounce } from 'lodash'
import { useLocation, useParams } from 'react-router-dom'

import {
  LazyCodeButton,
  Image,
  Code,
  EmptyPrompt,
  RedisUploadButton,
  Pagination
} from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/components'
import { getTutorialSection } from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/utils'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { Nullable } from 'uiSrc/utils'
import './styles/main.scss'
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
    sourcePath
  } = props
  const components: any = { LazyCodeButton, Image, Code, RedisUploadButton }
  const containerRef = useRef<HTMLDivElement>(null)
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const handleScroll = debounce(() => {
    if (containerRef.current && onScroll) {
      onScroll(containerRef.current.scrollTop)
    }
  }, 500)

  const sendEventClickExternalLinkTelemetry = (link: string = '') => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_LINK_CLICKED,
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
      if (scrollTop) {
        setTimeout(() => {
          containerRef.current?.scroll(0, scrollTop)
        }, 0)
      }
    }
  }, [isLoading, location])

  const contentComponent = useMemo(() => (
    // @ts-ignore
    <JsxParser
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
          <EuiButtonEmpty
            data-testid="enablement-area__page-close"
            iconType="arrowLeft"
            onClick={onClose}
            className={styles.backButton}
            aria-label="Back"
          >
            {backTitle}
          </EuiButtonEmpty>
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
          <div className={cx(styles.footer, 'eui-showFor--xl')}>
            <Pagination sourcePath={sourcePath} items={pagination} activePageKey={activeKey} />
          </div>
          <div className={cx(styles.footer, 'eui-hideFor--xl')}>
            <Pagination sourcePath={sourcePath} items={pagination} activePageKey={activeKey} compressed />
          </div>
        </>
      )}
    </div>
  )
}

export default InternalPage
