import React, { useContext } from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'
import { format, parseISO } from 'date-fns'
import { useParams } from 'react-router-dom'
import { findIndex, isNumber } from 'lodash'

import { Theme } from 'uiSrc/constants'
import {
  getCommandNameFromQuery,
  getVisualizationsByCommand,
  isGroupMode,
  truncateText,
  urlForAsset,
  truncateMilliseconds,
  isRawMode,
  isSilentMode,
  isSilentModeWithoutError,
  isGroupResults,
} from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { getViewTypeOptions, WBQueryType, getProfileViewTypeOptions, ProfileQueryType, isCommandAllowedForProfile } from 'uiSrc/pages/workbench/constants'
import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode, ResultsSummary } from 'uiSrc/slices/interfaces/workbench'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { FullScreen } from 'uiSrc/components'

import DefaultPluginIconDark from 'uiSrc/assets/img/workbench/default_view_dark.svg'
import DefaultPluginIconLight from 'uiSrc/assets/img/workbench/default_view_light.svg'
import { ReactComponent as ExecutionTimeIcon } from 'uiSrc/assets/img/workbench/execution_time.svg'
import { ReactComponent as GroupModeIcon } from 'uiSrc/assets/img/icons/group_mode.svg'
import { ReactComponent as SilentModeIcon } from 'uiSrc/assets/img/icons/silent_mode.svg'

import QueryCardTooltip from '../QueryCardTooltip'

import styles from './styles.module.scss'

export interface Props {
  query: string
  isOpen: boolean
  isFullScreen: boolean
  createdAt?: Date
  message?: string
  activeMode: RunQueryMode
  mode?: RunQueryMode
  resultsMode?: ResultsMode
  activeResultsMode?: ResultsMode
  summary?: ResultsSummary
  summaryText?: string
  queryType: WBQueryType
  selectedValue: string
  loading?: boolean
  clearing?: boolean
  executionTime?: number
  emptyCommand?: boolean
  db?: number
  toggleOpen: () => void
  toggleFullScreen: () => void
  setSelectedValue: (type: WBQueryType, value: string) => void
  onQueryDelete: () => void
  onQueryReRun: () => void
  onQueryProfile: (type: ProfileQueryType) => void
}

const getExecutionTimeString = (value: number): string => {
  if (value < 1) {
    return '0.001 msec'
  }
  return `${numberWithSpaces((parseFloat((value / 1000).toFixed(3))))} msec`
}

const getTruncatedExecutionTimeString = (value: number): string => {
  if (value < 1) {
    return '0.001 msec'
  }

  return truncateMilliseconds(parseFloat((value / 1000).toFixed(3)))
}

const QueryCardHeader = (props: Props) => {
  const {
    isOpen,
    toggleOpen,
    isFullScreen,
    toggleFullScreen,
    query = '',
    loading,
    clearing,
    message,
    createdAt,
    mode,
    resultsMode,
    summary,
    activeResultsMode,
    summaryText,
    activeMode,
    selectedValue,
    executionTime,
    emptyCommand = false,
    setSelectedValue,
    onQueryDelete,
    onQueryReRun,
    onQueryProfile,
    db,
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)
  const { spec: COMMANDS_SPEC } = useSelector(appRedisCommandsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const { theme } = useContext(ThemeContext)

  const eventStop = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const sendEvent = (event: TelemetryEvent, query: string, additionalData: object = {}) => {
    sendEventTelemetry({
      event,
      eventData: {
        databaseId: instanceId,
        command: getCommandNameFromQuery(query, COMMANDS_SPEC),
        ...additionalData
      }
    })
  }

  const handleCopy = (event: React.MouseEvent, query: string) => {
    sendEvent(TelemetryEvent.WORKBENCH_COMMAND_COPIED, query)
    eventStop(event)
    navigator.clipboard?.writeText?.(query)
  }

  const onDropDownViewClick = (event: React.MouseEvent) => {
    eventStop(event)
  }

  const onChangeView = (initValue: string) => {
    if (selectedValue === initValue) return
    const currentView = options.find(({ id }) => id === initValue)
    const previousView = options.find(({ id }) => id === selectedValue)
    const type = currentView.value
    setSelectedValue(type as WBQueryType, initValue)
    sendEvent(
      TelemetryEvent.WORKBENCH_RESULT_VIEW_CHANGED,
      query,
      {
        rawMode: isRawMode(activeMode),
        group: isGroupMode(activeResultsMode),
        previousView: previousView?.name,
        isPreviousViewInternal: !!previousView?.internal,
        currentView: currentView?.name,
        isCurrentViewInternal: !!currentView?.internal,
      }
    )
  }

  const handleQueryDelete = (event: React.MouseEvent) => {
    eventStop(event)
    onQueryDelete()
    sendEvent(TelemetryEvent.WORKBENCH_CLEAR_RESULT_CLICKED, query)
  }

  const handleQueryReRun = (event: React.MouseEvent) => {
    eventStop(event)
    onQueryReRun()
  }

  const getFormatTime = () => (createdAt
    && format(parseISO(createdAt?.toString()), `${parseISO(createdAt?.toString()).getFullYear() === new Date().getFullYear() ? 'LLL d,' : 'PP'} HH:mm:ss`)
  ) || ''

  const handleToggleOpen = () => {
    if (!isFullScreen && !isSilentModeWithoutError(resultsMode, summary?.fail)) {
      sendEvent(
        isOpen ? TelemetryEvent.WORKBENCH_RESULTS_COLLAPSED : TelemetryEvent.WORKBENCH_RESULTS_EXPANDED,
        query
      )
    }
    toggleOpen()
  }

  const pluginsOptions = getVisualizationsByCommand(query, visualizations)
    .map((visualization: IPluginVisualization) => ({
      id: visualization.uniqId,
      value: WBQueryType.Plugin,
      name: `${visualization.id}__${visualization.name}`,
      text: visualization.name,
      iconDark: (visualization.plugin.internal && visualization.iconDark)
        ? urlForAsset(visualization.plugin.baseUrl, visualization.iconDark)
        : DefaultPluginIconDark,
      iconLight: (visualization.plugin.internal && visualization.iconLight)
        ? urlForAsset(visualization.plugin.baseUrl, visualization.iconLight)
        : DefaultPluginIconLight,
      internal: visualization.plugin.internal
    }))

  const options: any[] = getViewTypeOptions()
  options.push(...pluginsOptions)
  const modifiedOptions: EuiSuperSelectOption<any>[] = options.map((item) => {
    const { value, id, text, iconDark, iconLight } = item
    return {
      value: id ?? value,
      inputDisplay: (
        <div className={styles.changeViewWrapper}>
          <EuiToolTip
            content={truncateText(text, 500)}
            position="left"
            anchorClassName={styles.tooltipIcon}
          >
            <EuiIcon
              className={styles.iconDropdownOption}
              type={theme === Theme.Dark ? iconDark : iconLight}
              data-testid={`view-type-selected-${value}-${id}`}
            />
          </EuiToolTip>
        </div>
      ),
      dropdownDisplay: (
        <div className={cx(styles.dropdownOption)}>
          <EuiIcon
            className={styles.iconDropdownOption}
            type={theme === Theme.Dark ? iconDark : iconLight}
          />
          <span>{truncateText(text, 20)}</span>
        </div>
      ),
      'data-test-subj': `view-type-option-${value}-${id}`,
    }
  })

  const profileOptions: EuiSuperSelectOption<any>[] = (getProfileViewTypeOptions() as any[]).map((item) => {
    const { value, id, text } = item
    return {
      value: id ?? value,
      inputDisplay: (
        <div className={cx(styles.dropdownOption, styles.dropdownProfileOption)}>
          <EuiIcon
            className={styles.iconDropdownOption}
            type="visTagCloud"
            data-testid={`view-type-selected-${value}-${id}`}
          />
        </div>
      ),
      dropdownDisplay: (
        <div className={cx(styles.dropdownOption, styles.dropdownProfileOption)}>
          <span>{truncateText(text, 20)}</span>
        </div>
      ),
      'data-test-subj': `profile-type-option-${value}-${id}`,
    }
  })

  const canCommandProfile = isCommandAllowedForProfile(query)

  const indexForSeparator = findIndex(pluginsOptions, (option) => !option.internal)
  if (indexForSeparator > -1) {
    modifiedOptions.splice(indexForSeparator + 1, 0, {
      value: '',
      disabled: true,
      inputDisplay: (<span className={styles.separator} />)
    })
  }

  return (
    <div
      onClick={handleToggleOpen}
      tabIndex={0}
      onKeyDown={() => {}}
      className={cx(
        styles.container,
        'query-card-header',
        {
          [styles.isOpen]: isOpen,
          [styles.notExpanded]: isSilentModeWithoutError(resultsMode, summary?.fail),
        },
      )}
      data-testid="query-card-open"
      role="button"
    >
      <EuiFlexGroup alignItems="center" gutterSize="l" responsive={false} style={{ width: '100%' }}>
        <EuiFlexItem
          className={styles.titleWrapper}
          grow
        >
          <div className="copy-btn-wrapper">
            <EuiTextColor className={styles.title} color="subdued" component="div" data-testid="query-card-command">
              <QueryCardTooltip query={query} summary={summaryText} db={db} resultsMode={resultsMode} />
            </EuiTextColor>
            <EuiButtonIcon
              iconType="copy"
              aria-label="Copy query"
              className="copy-btn"
              disabled={emptyCommand}
              onClick={(event: React.MouseEvent) => handleCopy(event, query || '')}
              data-testid="copy-command"
            />
          </div>
        </EuiFlexItem>
        <EuiFlexItem className={styles.controls} grow={false}>
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
            <EuiFlexItem className={cx(styles.time)} data-testid="command-execution-date-time">
              {!!createdAt && (
                <EuiTextColor className={styles.timeText} component="div">
                  {getFormatTime()}
                </EuiTextColor>
              )}
            </EuiFlexItem>
            <EuiFlexItem grow={false} className={styles.summaryTextWrapper}>
              {!!message && !isOpen && (
                <EuiTextColor className={styles.summaryText} component="div">
                  {truncateText(message, 13)}
                </EuiTextColor>
              )}
            </EuiFlexItem>
            <EuiFlexItem grow={false} className={styles.executionTime} data-testid="command-execution-time">
              {isNumber(executionTime) && (
                <EuiToolTip
                  title="Processing Time"
                  content={getExecutionTimeString(executionTime)}
                  position="left"
                  anchorClassName={cx(styles.tooltipIcon, styles.alignCenter)}
                  data-testid="execution-time-tooltip"
                >
                  <>
                    <EuiIcon
                      type={ExecutionTimeIcon}
                      data-testid="command-execution-time-icon"
                      className={styles.iconExecutingTime}
                    />
                    <EuiTextColor
                      className={cx(styles.summaryText, styles.executionTimeValue)}
                      data-testid="command-execution-time-value"
                    >
                      {getTruncatedExecutionTimeString(executionTime)}
                    </EuiTextColor>
                  </>
                </EuiToolTip>
              )}
            </EuiFlexItem>
            <EuiFlexItem
              grow={false}
              className={cx(styles.buttonIcon, styles.viewTypeIcon)}
              onClick={onDropDownViewClick}
            >
              {isOpen && canCommandProfile && !summaryText && (
                <div className={styles.dropdownWrapper}>
                  <div className={styles.dropdown}>
                    <EuiSuperSelect
                      options={profileOptions}
                      itemClassName={cx(styles.changeViewItem, styles.dropdownProfileItem)}
                      className={cx(styles.changeView, styles.dropdownProfileIcon)}
                      valueOfSelected={ProfileQueryType.Profile}
                      onChange={(value: ProfileQueryType) => onQueryProfile(value)}
                      data-testid="run-profile-type"
                    />
                  </div>
                </div>
              )}
            </EuiFlexItem>
            <EuiFlexItem
              grow={false}
              className={cx(styles.buttonIcon, styles.viewTypeIcon)}
              onClick={onDropDownViewClick}
            >
              {isOpen && options.length > 1 && !summaryText && (
                <div className={styles.dropdownWrapper}>
                  <div className={styles.dropdown}>
                    <EuiSuperSelect
                      options={modifiedOptions}
                      itemClassName={cx(styles.changeViewItem)}
                      className={cx(styles.changeView)}
                      valueOfSelected={selectedValue}
                      onChange={(value: string) => onChangeView(value)}
                      data-testid="select-view-type"
                    />
                  </div>
                </div>
              )}
            </EuiFlexItem>
            <EuiFlexItem grow={false} className={styles.buttonIcon} onClick={onDropDownViewClick}>
              {(isOpen || isFullScreen) && (
                <FullScreen isFullScreen={isFullScreen} onToggleFullScreen={toggleFullScreen} />
              )}
            </EuiFlexItem>
            <EuiFlexItem grow={false} className={styles.buttonIcon}>
              <EuiButtonIcon
                disabled={loading || clearing}
                iconType="trash"
                aria-label="Delete command"
                data-testid="delete-command"
                onClick={handleQueryDelete}
              />
            </EuiFlexItem>
            {!isFullScreen && (
              <EuiFlexItem grow={false} className={cx(styles.buttonIcon, styles.playIcon)}>
                <EuiToolTip
                  content="Run again"
                  position="left"
                >
                  <EuiButtonIcon
                    disabled={emptyCommand}
                    iconType="play"
                    aria-label="Re-run command"
                    data-testid="re-run-command"
                    onClick={handleQueryReRun}
                  />
                </EuiToolTip>
              </EuiFlexItem>
            )}
            {!isFullScreen && (
              <EuiFlexItem grow={false} className={styles.buttonIcon}>
                {!isSilentModeWithoutError(resultsMode, summary?.fail)
                  && <EuiButtonIcon iconType={isOpen ? 'arrowUp' : 'arrowDown'} aria-label="toggle collapse" />}
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false} className={styles.buttonIcon}>
              {(isRawMode(mode) || isGroupResults(resultsMode)) && (
                <EuiToolTip
                  className={styles.tooltip}
                  anchorClassName={styles.tooltipAnchor}
                  content={(
                    <>
                      {isGroupMode(resultsMode) && (
                        <EuiTextColor className={cx(styles.mode)} data-testid="group-mode-tooltip">
                          <EuiIcon type={GroupModeIcon} />
                        </EuiTextColor>
                      )}
                      {isSilentMode(resultsMode) && (
                        <EuiTextColor className={cx(styles.mode)} data-testid="silent-mode-tooltip">
                          <EuiIcon type={SilentModeIcon} />
                        </EuiTextColor>
                      )}
                      {isRawMode(mode) && (
                        <EuiTextColor className={cx(styles.mode)} data-testid="raw-mode-tooltip">
                          -r
                        </EuiTextColor>
                      )}
                    </>
                  )}
                  position="bottom"
                  data-testid="parameters-tooltip"
                >
                  <EuiIcon
                    color="subdued"
                    type="boxesVertical"
                    data-testid="parameters-anchor"
                  />
                </EuiToolTip>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default QueryCardHeader
