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
import { format } from 'date-fns'

import { Theme } from 'uiSrc/constants'
import { getVisualizationsByCommand, truncateText, urlForAsset } from 'uiSrc/utils'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { getViewTypeOptions, WBQueryType } from 'uiSrc/pages/workbench/constants'

import DefaultPluginIconDark from 'uiSrc/assets/img/workbench/default_view_dark.svg'
import DefaultPluginIconLight from 'uiSrc/assets/img/workbench/default_view_light.svg'

import QueryCardTooltip from '../QueryCardTooltip'

import styles from './styles.module.scss'

export interface Props {
  query: string;
  isOpen: boolean;
  isFullScreen: boolean;
  time?: number;
  summaryText?: string;
  queryType: WBQueryType;
  selectedValue: string;
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
    summaryText,
    time,
    selectedValue,
    setSelectedValue,
    onQueryDelete,
    onQueryReRun
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)

  const { theme } = useContext(ThemeContext)

  const eventStop = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleCopy = (event: React.MouseEvent, text: string) => {
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
  }

  const handleQueryDelete = (event: React.MouseEvent) => {
    eventStop(event)
    onQueryDelete()
  }

  const handleQueryReRun = (event: React.MouseEvent) => {
    eventStop(event)
    onQueryReRun()
  }

  const getLocaleTime = () => (time
    && format(time, `${new Date(time).getFullYear() === new Date().getFullYear() ? 'LLL d,' : 'PP'} HH:mm:ss`)
  ) || ''

  const pluginsOptions = getVisualizationsByCommand(query, visualizations)
    .map((visualization: any) => ({
      id: visualization.uniqId,
      value: WBQueryType.Plugin,
      text: visualization.name,
      iconDark: (visualization.plugin.internal && visualization.iconDark)
        ? urlForAsset(visualization.plugin.baseUrl, visualization.iconDark)
        : DefaultPluginIconDark,
      iconLight: (visualization.plugin.internal && visualization.iconLight)
        ? urlForAsset(visualization.plugin.baseUrl, visualization.iconLight)
        : DefaultPluginIconLight,
    }))

  const options: EuiSuperSelectOption<string>[] = getViewTypeOptions()
  options.push(...pluginsOptions)
  const modifiedOptions = options.map((item) => {
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
              type={theme === Theme.Dark ? iconDark : iconLight}
              data-testid={`view-type-selected-${value}-${id}`}
            />
          </EuiToolTip>
        </div>
      ),
      dropdownDisplay: truncateText(text, 20),
      'data-test-subj': `view-type-option-${value}-${id}`,
    }
  })

  return (
    <div
      onClick={toggleOpen}
      tabIndex={0}
      onKeyDown={() => {}}
      className={cx(styles.container, 'query-card-header', { [styles.isOpen]: isOpen })}
      data-testid="query-card-open"
      role="button"
    >
      <EuiFlexGroup alignItems="center" gutterSize="l" responsive={false} style={{ width: '100%' }}>
        <EuiFlexItem className={cx(styles.titleWrapper, { [styles.titleWrapperShort]: !!time })} grow={!time}>
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
        <EuiFlexItem className={cx(styles.time)}>
          {!!time && (
            <EuiTextColor className={styles.timeText} component="div">
              {getLocaleTime()}
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
            <EuiSuperSelect
              options={modifiedOptions}
              itemClassName={cx('withColorDefinition', styles.changeViewItem)}
              className={cx(styles.changeView)}
              valueOfSelected={selectedValue}
              onChange={(value: string) => onChangeView(value)}
              data-testid="select-view-type"
            />
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
          <EuiButtonIcon iconType="trash" aria-label="Delete command" data-testid="delete-command" onClick={handleQueryDelete} />
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
