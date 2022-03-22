import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiBasicTableColumn,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiTextColor,
} from '@elastic/eui'
import parse from 'html-react-parser'

import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import { Theme } from 'uiSrc/constants'
import PromoLink from 'uiSrc/components/promo-link/PromoLink'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { getPathToResource } from 'uiSrc/services/resourcesService'
import { ContentCreateRedis } from 'uiSrc/slices/interfaces/content'

import styles from './styles.module.scss'

interface IContentColumn {
  title: string
  text: string
}

export interface IModuleNotLoadedContent {
  output?: string
  createCloudBtnText?: string
  createCloudBtnHref?: string
  summaryText?: string
  summaryImgDark?: string
  summaryImgLight?: string
  summaryImgPath?: string
  columns?: IContentColumn[]
}

export interface Props {
  content: IModuleNotLoadedContent
}

const ModuleNotLoaded = ({ content = {} }: Props) => {
  const {
    output = '',
    summaryText = '',
    summaryImgDark = '',
    summaryImgLight = '',
    summaryImgPath = '',
    columns = []
  } = content
  const { loading, data: createDbContent } = useSelector(contentSelector)

  const { theme } = useContext(ThemeContext)

  const columnsSettings: EuiBasicTableColumn<any>[] = columns.map(({ title }, i) => ({
    name: title,
    field: `text${i}`,
    dataType: 'string',
    truncateText: false,
    render: (text: any) => parse(text)
  }))

  const item = columns.reduce((obj, { text }, i) => ({ ...obj, [`text${i}`]: text }), {})

  const handleClickLink = (event: TelemetryEvent, eventData: any = {}) => {
    sendEventTelemetry({
      event,
      eventData: {
        ...eventData
      }
    })
  }
  const CreateCloudBtn = ({ content }: { content: ContentCreateRedis }) => {
    const { title, description, styles, links } = content
    // @ts-ignore
    const linkStyles = styles ? styles[theme] : {}
    return (
      <PromoLink
        title={title}
        description={description}
        url={links?.redisearch?.url}
        testId="promo-btn"
        icon="arrowRight"
        onClick={() => handleClickLink(
          links?.redisearch?.event as TelemetryEvent,
          { source: 'RediSearch is not loaded' }
        )}
        styles={{
          ...linkStyles,
          backgroundImage: linkStyles?.backgroundImage
            ? `url(${getPathToResource(linkStyles.backgroundImage)})`
            : undefined
        }}
      />
    )
  }

  return (
    <div className={cx(styles.container)}>
      <EuiFlexGroup direction="column" gutterSize="s">
        {!!output && (
        <EuiFlexItem className="query-card-output-response-fail">
          <span data-testid="query-card-no-module-output">
            <span className={styles.alertIconWrapper}>
              <EuiIcon type="alert" color="danger" style={{ display: 'inline', marginRight: 10 }} />
            </span>
            <EuiTextColor color="danger">{parse(output)}</EuiTextColor>
          </span>
        </EuiFlexItem>
        )}
        {!!columns?.length && (
          <EuiFlexItem>
            <EuiInMemoryTable
              className={cx('inMemoryTableDefault', 'imtd-multiLineCells', styles.table)}
              columns={columnsSettings}
              items={[item]}
              data-test-subj="query-card-no-module-table"
            />
          </EuiFlexItem>
        )}
        { !loading && createDbContent?.cloud && (
          <EuiFlexItem grow={false} data-testid="query-card-no-module-button" style={{ margin: '20px 0' }}>
            <CreateCloudBtn content={createDbContent.cloud} />
          </EuiFlexItem>
        )}
        {(!!summaryText || !!summaryImgPath || !!summaryImgDark || !!summaryImgLight) && (
          <EuiFlexItem>
            <div className={cx(styles.summary)}>
              {(!!summaryImgPath || !!summaryImgDark || !!summaryImgLight) && (
                <div>
                  <img
                    src={theme === Theme.Dark ? summaryImgDark : summaryImgLight}
                    className={cx(styles.summaryImg)}
                    data-testid="query-card-no-module-summary-img"
                    alt="redisearch table"
                  />
                </div>
              )}
              {!!summaryText && <div data-testid="query-card-no-module-summary-text">{parse(summaryText)}</div>}
            </div>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </div>
  )
}

export default ModuleNotLoaded
