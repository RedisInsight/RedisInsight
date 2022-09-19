// import {
//   EuiLoadingContent,
//   EuiText,
//   EuiToolTip,
// } from '@elastic/eui'
import React from 'react'
import cx from 'classnames'
import {
  EuiSuperSelect,
  EuiSuperSelectOption,
} from '@elastic/eui'
// import { useSelector } from 'react-redux'
// import cx from 'classnames'
// import { capitalize } from 'lodash'

// import {
//   truncateNumberToFirstUnit,
//   formatLongName,
//   truncateNumberToDuration,
// } from 'uiSrc/utils'
// import { nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
// import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
// import { ConnectionType, CONNECTION_TYPE_DISPLAY } from 'uiSrc/slices/interfaces'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
// import { clusterDetailsSelector } from 'uiSrc/slices/analytics/clusterDetails'

import styles from './styles.module.scss'

interface IMetrics {
  label: string
  value: any
  border?: 'left'
}

const Header = (props) => {
  const { analysis, selectedValue, onChangeSelectedAnalysis } = props
  console.log(analysis, selectedValue)
  // const {
  //   username = DEFAULT_USERNAME,
  //   connectionType = ConnectionType.Cluster,
  // } = useSelector(connectedInstanceSelector)

  // const {
  //   data,
  //   loading,
  // } = useSelector(clusterDetailsSelector)

  // const metrics: IMetrics[] = [{
  //   label: 'Type',
  //   value: CONNECTION_TYPE_DISPLAY[connectionType],
  // }, {
  //   label: 'Version',
  //   value: data?.version || '',
  // }, {
  //   label: 'User',
  //   value: (username || DEFAULT_USERNAME)?.length < MAX_NAME_LENGTH
  //     ? (username || DEFAULT_USERNAME)
  //     : (
  //       <EuiToolTip
  //         className={styles.tooltip}
  //         position="bottom"
  //         content={(
  //           <>
  //             {formatLongName(username || DEFAULT_USERNAME)}
  //           </>
  //         )}
  //       >
  //         <div data-testid="cluster-details-username">{formatLongName(username || DEFAULT_USERNAME, MAX_NAME_LENGTH, 5)}</div>
  //       </EuiToolTip>
  //     ),
  // }, {
  //   label: 'Uptime',
  //   border: 'left',
  //   value: (
  //     <EuiToolTip
  //       className={styles.tooltip}
  //       anchorClassName="truncateText"
  //       position="top"
  //       content={(
  //         <>
  //           {`${nullableNumberWithSpaces(data?.uptimeSec) || 0} s`}
  //           <br />
  //           {`(${truncateNumberToDuration(data?.uptimeSec || 0)})`}
  //         </>
  //       )}
  //     >
  //       <div data-testid="cluster-details-uptime">{truncateNumberToFirstUnit(data?.uptimeSec || 0)}</div>
  //     </EuiToolTip>
  //   )
  // }]

  const analysisOptions: EuiSuperSelectOption<any>[] = analysis.map((item) => {
    const { createdAt, id } = item
    return {
      value: id,
      inputDisplay: (
        <span>{createdAt}</span>
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
      <div className={styles.container}>
        {analysis.length ? (
          <div>
            <span>Report generated on:</span>
            <div className={styles.dropdown}>
              <EuiSuperSelect
                options={analysisOptions}
                itemClassName={cx(styles.changeViewItem)}
                className={cx(styles.changeView)}
                valueOfSelected={selectedValue}
                onChange={(value: string) => onChangeSelectedAnalysis(value)}
                data-testid="select-view-type"
              />
            </div>
          </div>
        ) : (
          <div />
        )}
        <div>
          <button>New analysis</button>
          <span>Tooltip</span>
        </div>
      </div>
      {/* {loading && !data && (
        <div className={styles.loading} data-testid="cluster-details-loading">
          <EuiLoadingContent lines={2} />
        </div>
      )}
      {data && (
        <div className={cx(styles.content)} data-testid="cluster-details-content">
          {metrics.map(({ value, label, border }) => (
            <div
              className={cx(styles.item, styles[`border${capitalize(border)}`])}
              key={label}
              data-testid={`cluster-details-item-${label}`}
            >
              <EuiText color="subdued" className={styles.value}>{value}</EuiText>
              <EuiText className={styles.label}>{label}</EuiText>
            </div>
          ))}
        </div>
      )} */}
    </div>
  )
}

export default Header
