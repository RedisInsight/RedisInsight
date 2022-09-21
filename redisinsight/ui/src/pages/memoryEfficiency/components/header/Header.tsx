// import {
//   EuiLoadingContent,
//   EuiText,
//   EuiToolTip,
// } from '@elastic/eui'
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

import {
  createNewAnalysis,
} from 'uiSrc/slices/analytics/memoryEfficiency'
import {
  appContextBrowserTree
} from 'uiSrc/slices/app/context'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { getApproximateNumber } from 'uiSrc/utils/validations'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'

import styles from './styles.module.scss'

export const getFormatTime = (time: string = '') =>
  format(new Date(time), 'd MMM yyyy HH:mm')

interface Props {
  analysis: string
  selectedValue: any
  progress: any
  onChangeSelectedAnalysis: (value: any) => void
}

const Header = (props: Props) => {
  const { analysis, selectedValue, onChangeSelectedAnalysis, progress = null } = props
  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const { delimiter } = useSelector(appContextBrowserTree)

  const analysisOptions: EuiSuperSelectOption<any>[] = analysis.map((item) => {
    const { createdAt, id } = item
    return {
      value: id,
      inputDisplay: (
        <span>{getFormatTime(createdAt)}</span>
      ),
      // dropdownDisplay: (
      //   <div className={cx(styles.dropdownOption)}>
      //     <EuiIcon
      //       className={styles.iconDropdownOption}
      //       type={theme === Theme.Dark ? iconDark : iconLight}
      //     />
      //     <span>{truncateText(text, 20)}</span>
      //   </div>
      // ),
      'data-test-subj': `view-type-option-${id}`,
    }
  })

  return (
    // <div className={styles.container} data-testid="cluster-details-header">
    <div>
      <AnalyticsTabs />
      <EuiFlexGroup className={styles.container} gutterSize="none" alignItems="center" justifyContent="spaceBetween">
        {analysis.length ? (
          <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiText color="subdued">Report generated on:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSuperSelect
                options={analysisOptions}
                style={{ border: 'none !important' }}
                className={styles.changeReport}
                popoverClassName={styles.changeReport}
                valueOfSelected={selectedValue}
                onChange={(value: string) => onChangeSelectedAnalysis(value)}
                data-testid="select-view-type"
              />
            </EuiFlexItem>
            {!!progress && (
              <EuiFlexItem grow={false}>
                <EuiText color="subdued" className={cx(styles.progress, styles.progressContainer)} data-testid="bulk-delete-summary">
                  <EuiText
                    color={progress.total === progress.processed ? 'subdued' : 'warning'}
                    className={styles.progress}
                    data-testid="bulk-delete-summary"
                  >
                    {`Scanned ${getApproximateNumber((progress.total ? progress.processed / progress.total : 1) * 100)}%`}
                  </EuiText>
                  {` (${numberWithSpaces(progress.processed)}/${numberWithSpaces(progress.total)} keys)`}
                </EuiText>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        ) : (
          <div />
        )}
        <div>
          <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
            <EuiFlexItem style={{ overflow: 'hidden' }}>
              <EuiButton
                aria-label="New analysis"
                fill
                data-testid="enablement-area__next-page-btn"
                color="secondary"
                iconType="playFilled"
                iconSide="left"
                onClick={() => dispatch(createNewAnalysis(instanceId, delimiter))}
                size="s"
              >
                New analysis
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem style={{ paddingLeft: 12 }} grow={false}>
              <EuiToolTip
                position="bottom"
                anchorClassName={styles.tooltipAnchor}
                className={styles.tooltip}
                title="Memory efficiency"
                content="Analyze up to 10K keys in your Redis database to get an overview of your data and memory efficiency recommendations."
              >
                <EuiIcon
                  className={styles.infoIcon}
                  type="iInCircle"
                  size="l"
                  style={{ cursor: 'pointer' }}
                  data-testid="db-info-icon"
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </EuiFlexGroup>
    </div>
  )
}

export default Header
