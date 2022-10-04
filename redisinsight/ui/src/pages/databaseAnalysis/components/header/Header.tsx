import React from 'react'
import cx from 'classnames'
import { format } from 'date-fns'
import {
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiToolTip,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiButton,
  EuiText
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { localStorageService } from 'uiSrc/services'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { getApproximatePercentage } from 'uiSrc/utils/validations'
import { BrowserStorageItem, DEFAULT_DELIMITER } from 'uiSrc/constants'
import { appContextBrowserTree } from 'uiSrc/slices/app/context'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ShortDatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import { AnalysisProgress } from 'apiSrc/modules/database-analysis/models/analysis-progress'

import styles from './styles.module.scss'

const dateFormat = 'd MMM yyyy HH:mm'

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
    analysisLoading
  } = props

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const { delimiter = '' } = useSelector(appContextBrowserTree)

  const delimiterStorage = localStorageService.get(BrowserStorageItem.treeViewDelimiter + instanceId)
    || delimiter
    || DEFAULT_DELIMITER

  const analysisOptions: EuiSuperSelectOption<any>[] = items.map((item) => {
    const { createdAt, id } = item
    return {
      value: id,
      inputDisplay: (
        <span>{format(new Date(createdAt ?? ''), dateFormat)}</span>
      ),
      'data-test-subj': `items-report-${id}`,
    }
  })

  const handleClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.MEMORY_ANALYSIS_STARTED,
      eventData: {
        databaseId: instanceId,
      }
    })
    dispatch(createNewAnalysis(instanceId, delimiterStorage))
  }

  return (
    <div data-testid="db-analysis-header">
      <AnalyticsTabs />
      <EuiFlexGroup
        className={styles.container}
        gutterSize="none"
        alignItems="center"
        justifyContent={items.length ? 'spaceBetween' : 'flexEnd'}
      >
        {!!items.length && (
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiText color="subdued">Report generated on:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiSuperSelect
                  options={analysisOptions}
                  style={{ border: 'none !important' }}
                  className={styles.changeReport}
                  popoverClassName={styles.changeReport}
                  valueOfSelected={selectedValue ?? ''}
                  onChange={(value: string) => onChangeSelectedAnalysis(value)}
                  data-testid="select-report"
                />
              </EuiFlexItem>
              {!!progress && (
                <EuiFlexItem grow={false}>
                  <EuiText color="subdued" className={cx(styles.progress, styles.progressContainer)} data-testid="bulk-delete-summary">
                    <EuiText
                      color={progress.total === progress.processed ? 'subdued' : 'warning'}
                      className={styles.progress}
                      data-testid="analysis-progress"
                    >
                      {'Scanned '}
                      {getApproximatePercentage(progress.total, progress.processed)}
                    </EuiText>
                    {` (${numberWithSpaces(progress.processed)}`}
                    /
                    {numberWithSpaces(progress.total)}
                    {' keys) '}
                  </EuiText>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
        )}
        <EuiFlexItem grow={false}>
          <EuiFlexGroup gutterSize="none" alignItems="center">
            <EuiFlexItem style={{ overflow: 'hidden' }}>
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
                New reports
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem style={{ paddingLeft: 12 }} grow={false}>
              <EuiToolTip
                position="bottom"
                anchorClassName={styles.tooltipAnchor}
                className={styles.tooltip}
                title="Memory Efficiency"
                content="Analyze up to 10K keys in your Redis database to get an overview of your data and memory efficiency recommendations."
              >
                <EuiIcon
                  className={styles.infoIcon}
                  type="iInCircle"
                  size="l"
                  data-testid="db-new-reports-icon"
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default Header
