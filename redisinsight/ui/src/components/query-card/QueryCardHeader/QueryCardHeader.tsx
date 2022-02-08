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
import { findIndex } from 'lodash'

import { Theme } from 'uiSrc/constants'
import { getVisualizationsByCommand, truncateText, urlForAsset } from 'uiSrc/utils'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { getViewTypeOptions, WBQueryType } from 'uiSrc/pages/workbench/constants'
import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'

import DefaultPluginIconDark from 'uiSrc/assets/img/workbench/default_view_dark.svg'
import DefaultPluginIconLight from 'uiSrc/assets/img/workbench/default_view_light.svg'

import QueryCardTooltip from '../QueryCardTooltip'

import styles from './styles.module.scss'

export interface Props {
  query: string;
  isOpen: boolean;
  isFullScreen: boolean;
  createdAt?: Date;
  summaryText?: string;
  queryType: WBQueryType;
  selectedValue: string;
  loading?: boolean;
  toggleOpen: () => void;
  toggleFullScreen: () => void;
  setSelectedValue: (type: WBQueryType, value: string) => void;
  onQueryDelete: () => void;
  onQueryReRun: () => void;
}

const QueryCardHeader = (props: Props) => {
  const {
    isOpen,
    toggleOpen,
    isFullScreen,
    toggleFullScreen,
    query = '',
    loading,
    summaryText,
    createdAt,
    selectedValue,
    setSelectedValue,
    onQueryDelete,
    onQueryReRun
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(appRedisCommandsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const { theme } = useContext(ThemeContext)

  const eventStop = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleCopy = (event: React.MouseEvent, text: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_COMMAND_COPIED,
      eventData: {
        databaseId: instanceId
      }
    })
    eventStop(event)
    navigator.clipboard.writeText(text)
  }

  const onDropDownViewClick = (event: React.MouseEvent) => {
    eventStop(event)
  }

  const onChangeView = (initValue: string) => {
    if (selectedValue === initValue) return
    const type: string = initValue in WBQueryType ? initValue : WBQueryType.Plugin
    setSelectedValue(type as WBQueryType, initValue)
    sendEventChangeVisualizationTelemetry(initValue)
  }

  const handleQueryDelete = (event: React.MouseEvent) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_COMMAND_DELETE_COMMAND,
      eventData: {
        databaseId: instanceId
      }
    })
    eventStop(event)
    onQueryDelete()
  }

  const handleQueryReRun = (event: React.MouseEvent) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_COMMAND_RUN_AGAIN,
      eventData: {
        databaseId: instanceId
      }
    })
    eventStop(event)
    onQueryReRun()
  }

  const getFormatTime = () => (createdAt
    && format(parseISO(createdAt?.toString()), `${parseISO(createdAt?.toString()).getFullYear() === new Date().getFullYear() ? 'LLL d,' : 'PP'} HH:mm:ss`)
  ) || ''

  const isViewInternal = (view: string = '') => !!options.find(({ id }) => id === view)?.internal

  const getCommandForTelemetry = (query: string = '') => REDIS_COMMANDS_ARRAY.find((commandName) =>
    query.toUpperCase().startsWith(commandName)) ?? query.split(' ')?.[0]

  const sendEventToggleOpenTelemetry = () => {
    const matchedCommand = getCommandForTelemetry(query)

    sendEventTelemetry({
      event: isOpen
        ? TelemetryEvent.WORKBENCH_RESULTS_COLLAPSED
        : TelemetryEvent.WORKBENCH_RESULTS_EXPANDED,
      eventData: {
        databaseId: instanceId,
        command: matchedCommand
      }
    })
  }

  const sendEventChangeVisualizationTelemetry = (value: string = '') => {
    const matchedCommand = getCommandForTelemetry(query)

    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_RESULT_VIEW_CHANGED,
      eventData: {
        databaseId: instanceId,
        command: matchedCommand,
        previousView: selectedValue,
        isPreviousViewInternal: isViewInternal(selectedValue),
        currentView: value,
        isCurrentViewInternal: isViewInternal(value),
      }
    })
  }

  const handleToggleOpen = () => {
    if (!isFullScreen) {
      sendEventToggleOpenTelemetry()
    }

    toggleOpen()
  }

  const pluginsOptions = getVisualizationsByCommand(query, visualizations)
    .map((visualization: IPluginVisualization) => ({
      id: visualization.uniqId,
      value: WBQueryType.Plugin,
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
      className={cx(styles.container, 'query-card-header', { [styles.isOpen]: isOpen })}
      data-testid="query-card-open"
      role="button"
    >
      <EuiFlexGroup alignItems="center" gutterSize="l" responsive={false} style={{ width: '100%' }}>
        <EuiFlexItem
          className={cx(styles.titleWrapper, { [styles.titleWrapperShort]: !!createdAt })}
          grow={!createdAt}
        >
          <div className="copy-btn-wrapper">
            <EuiTextColor className={styles.title} color="subdued" component="div" data-testid="query-card-command">
              <QueryCardTooltip query={query} />
            </EuiTextColor>
            <EuiButtonIcon
              iconType="copy"
              aria-label="Copy query"
              className="copy-btn"
              onClick={(event: React.MouseEvent) => handleCopy(event, query)}
            />
          </div>
        </EuiFlexItem>
        <EuiFlexItem className={cx(styles.time)} data-testid="command-execution-date-time">
          {!!createdAt && (
            <EuiTextColor className={styles.timeText} component="div">
              {getFormatTime()}
            </EuiTextColor>
          )}
          {!!summaryText && !isOpen && (
            <EuiTextColor className={styles.summaryText} component="div">
              {truncateText(summaryText, 17)}
            </EuiTextColor>
          )}
        </EuiFlexItem>
        <EuiFlexItem
          grow={false}
          className={cx(styles.buttonIcon, styles.viewTypeIcon)}
          onClick={onDropDownViewClick}
        >
          {isOpen && options.length > 1 && (
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
            <EuiToolTip
              content={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              position="left"
            >
              <EuiButtonIcon
                iconType={isFullScreen ? 'fullScreenExit' : 'fullScreen'}
                color="primary"
                aria-label="Open full screen"
                onClick={toggleFullScreen}
                data-testid="toggle-full-screen"
              />
            </EuiToolTip>
          )}
        </EuiFlexItem>
        <EuiFlexItem grow={false} className={styles.buttonIcon}>
          <EuiButtonIcon
            disabled={loading}
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
              <EuiButtonIcon iconType="play" aria-label="Re-run command" data-testid="re-run-command" onClick={handleQueryReRun} />
            </EuiToolTip>
          </EuiFlexItem>
        )}
        {!isFullScreen && (
          <EuiFlexItem grow={false} className={styles.buttonIcon}>
            <EuiButtonIcon iconType={isOpen ? 'arrowUp' : 'arrowDown'} aria-label="toggle collapse" />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </div>
  )
}

export default QueryCardHeader
