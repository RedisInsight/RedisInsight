import React from 'react'
import cx from 'classnames'
import {
  EuiButton,
  EuiHideFor,
  EuiIcon,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { getApproximatePercentage } from 'uiSrc/utils/validations'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
import { comboBoxToArray, getDbIndex, Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  ANALYZE_CLUSTER_TOOLTIP_MESSAGE,
  ANALYZE_TOOLTIP_MESSAGE,
} from 'uiSrc/constants/recommendations'
import { FormatedDate } from 'uiSrc/components'
import { DEFAULT_DELIMITER } from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/Flex'
import { ShortDatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import { AnalysisProgress } from 'apiSrc/modules/database-analysis/models/analysis-progress'

import styles from './styles.module.scss'

export interface Props {
  items: ShortDatabaseAnalysis[]
  selectedValue: Nullable<string>
  progress?: AnalysisProgress
  analysisLoading: boolean
  onChangeSelectedAnalysis: (value: string) => void
}

const Header = (props: Props) => {
  const {
    items = [],
    selectedValue,
    onChangeSelectedAnalysis,
    progress = null,
    analysisLoading,
  } = props

  const { connectionType, provider } = useSelector(connectedInstanceSelector)
  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const { treeViewDelimiter = [DEFAULT_DELIMITER] } =
    useSelector(appContextDbConfig)

  const analysisOptions: EuiSuperSelectOption<any>[] = items.map((item) => {
    const { createdAt, id, db } = item
    return {
      value: id,
      inputDisplay: (
        <>
          <span>{`${getDbIndex(db)} `}</span>
          <FormatedDate date={createdAt || ''} />
        </>
      ),
      'data-test-subj': `items-report-${id}`,
    }
  })

  const handleClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_ANALYSIS_STARTED,
      eventData: {
        databaseId: instanceId,
        provider,
      },
    })
    dispatch(createNewAnalysis(instanceId, comboBoxToArray(treeViewDelimiter)))
  }

  return (
    <div data-testid="db-analysis-header">
      <AnalyticsTabs />
      <Row
        className={styles.container}
        align="center"
        justify={items.length ? 'between' : 'end'}
      >
        {!!items.length && (
          <FlexItem>
            <Row align="center"
              wrap
            >
              <EuiHideFor sizes={['xs', 's']}>
                <FlexItem>
                  <EuiText className={styles.text} size="s">
                    Report generated on:
                  </EuiText>
                </FlexItem>
              </EuiHideFor>
              <FlexItem grow>
                <EuiSuperSelect
                  options={analysisOptions}
                  style={{ border: 'none !important' }}
                  className={styles.changeReport}
                  popoverClassName={styles.changeReport}
                  valueOfSelected={selectedValue ?? ''}
                  onChange={(value: string) => onChangeSelectedAnalysis(value)}
                  data-testid="select-report"
                />
              </FlexItem>
              {!!progress && (
                <FlexItem>
                  <EuiText
                    className={cx(
                      styles.progress,
                      styles.text,
                      styles.progressContainer,
                    )}
                    size="s"
                    data-testid="bulk-delete-summary"
                  >
                    <EuiText
                      color={
                        progress.total === progress.processed
                          ? undefined
                          : 'warning'
                      }
                      className={cx(styles.progress, styles.text)}
                      size="s"
                      data-testid="analysis-progress"
                    >
                      {'Scanned '}
                      {getApproximatePercentage(
                        progress.total,
                        progress.processed,
                      )}
                    </EuiText>
                    {` (${numberWithSpaces(progress.processed)}`}/
                    {numberWithSpaces(progress.total)}
                    {' keys) '}
                  </EuiText>
                </FlexItem>
              )}
            </Row>
          </FlexItem>
        )}
        <FlexItem>
          <Row align="center"
          >
            <FlexItem grow>
              <EuiButton
                aria-label="New reports"
                fill
                data-testid="start-database-analysis-btn"
                color="secondary"
                iconType="playFilled"
                iconSide="left"
                disabled={analysisLoading}
                onClick={handleClick}
                size="s"
              >
                New Report
              </EuiButton>
            </FlexItem>
            <FlexItem style={{ paddingLeft: 6 }}>
              <EuiToolTip
                position="bottom"
                anchorClassName={styles.tooltipAnchor}
                className={styles.tooltip}
                title="Database Analysis"
                data-testid="db-new-reports-tooltip"
                content={
                  connectionType === ConnectionType.Cluster
                    ? ANALYZE_CLUSTER_TOOLTIP_MESSAGE
                    : ANALYZE_TOOLTIP_MESSAGE
                }
              >
                <EuiIcon
                  className={styles.infoIcon}
                  type="iInCircle"
                  size="l"
                  data-testid="db-new-reports-icon"
                />
              </EuiToolTip>
            </FlexItem>
          </Row>
        </FlexItem>
      </Row>
    </div>
  )
}

export default Header
