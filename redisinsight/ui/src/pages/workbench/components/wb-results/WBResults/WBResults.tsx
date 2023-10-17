import React, { useContext } from 'react'
import cx from 'classnames'
import { EuiButtonEmpty, EuiIcon, EuiText } from '@elastic/eui'

import { CodeButtonParams, Theme } from 'uiSrc/constants'
import { ProfileQueryType } from 'uiSrc/pages/workbench/constants'
import { generateProfileQueryForCommand } from 'uiSrc/pages/workbench/utils'
import { Nullable } from 'uiSrc/utils'
import QueryCard from 'uiSrc/components/query-card'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import TelescopeDark from 'uiSrc/assets/img/telescope-dark.svg'
import TelescopeLight from 'uiSrc/assets/img/telescope-light.svg'
import { ReactComponent as ArrowToGuidesIcon } from 'uiSrc/assets/img/workbench/arrow-to-guides.svg'

import styles from './styles.module.scss'

export interface Props {
  items: CommandExecutionUI[]
  clearing: boolean
  processing: boolean
  activeMode: RunQueryMode
  activeResultsMode?: ResultsMode
  scrollDivRef: React.Ref<HTMLDivElement>
  onQueryReRun: (query: string, commandId?: Nullable<string>, executeParams?: CodeButtonParams) => void
  onQueryDelete: (commandId: string) => void
  onAllQueriesDelete: () => void
  onQueryOpen: (commandId: string) => void
  onQueryProfile: (query: string, commandId?: Nullable<string>, executeParams?: CodeButtonParams) => void
}
const WBResults = (props: Props) => {
  const {
    items = [],
    clearing,
    processing,
    activeMode,
    activeResultsMode,
    onQueryReRun,
    onQueryProfile,
    onQueryDelete,
    onAllQueriesDelete,
    onQueryOpen,
    scrollDivRef
  } = props
  const { theme } = useContext(ThemeContext)

  const NoResults = (
    <div className={styles.noResults} data-testid="wb_no-results">
      <EuiIcon className={styles.arrowToGuides} type={ArrowToGuidesIcon} size="original" />
      <EuiIcon
        className={styles.noResultsIcon}
        type={theme === Theme.Dark ? TelescopeDark : TelescopeLight}
        size="original"
        data-testid="wb_no-results__icon"
      />
      <EuiText className={styles.noResultsTitle} data-testid="wb_no-results__title">
        No results to display yet, <br /> but here&apos;s a good starting point
      </EuiText>
      <EuiText className={styles.noResultsText} data-testid="wb_no-results__summary">
        Explore the amazing world of Redis Stack <br /> with our interactive guides
      </EuiText>
    </div>
  )

  const handleQueryProfile = (
    profileType: ProfileQueryType,
    commandExecution: { command: string, mode?: RunQueryMode, resultsMode?: ResultsMode }
  ) => {
    const { command, mode, resultsMode } = commandExecution
    const profileQuery = generateProfileQueryForCommand(command, profileType)
    if (profileQuery) {
      onQueryProfile(
        profileQuery,
        null,
        { mode, results: resultsMode, clearEditor: false, },
      )
    }
  }

  return (
    <div className={styles.wrapper}>
      {!!items.length && (
        <div className={styles.header}>
          <EuiButtonEmpty
            size="s"
            iconType="trash"
            className={styles.clearAllBtn}
            onClick={() => onAllQueriesDelete?.()}
            disabled={clearing || processing}
            data-testid="clear-history-btn"
          >
            Clear Results
          </EuiButtonEmpty>
        </div>
      )}
      <div className={cx(styles.container)}>
        <div ref={scrollDivRef} />
        {items.length ? items.map((
          {
            command = '',
            isOpen = false,
            result = undefined,
            summary = undefined,
            id = '',
            loading,
            createdAt,
            mode,
            resultsMode,
            emptyCommand,
            isNotStored,
            executionTime,
            db,
          }
        ) => (
          <QueryCard
            id={id}
            key={id}
            isOpen={isOpen}
            result={result}
            summary={summary}
            clearing={clearing}
            loading={loading}
            command={command}
            createdAt={createdAt}
            activeMode={activeMode}
            emptyCommand={emptyCommand}
            isNotStored={isNotStored}
            executionTime={executionTime}
            mode={mode}
            activeResultsMode={activeResultsMode}
            resultsMode={resultsMode}
            db={db}
            onQueryOpen={() => onQueryOpen(id)}
            onQueryProfile={(profileType) => handleQueryProfile(
              profileType,
              { command, mode, resultsMode },
            )}
            onQueryReRun={() => onQueryReRun(
              command,
              null,
              { mode, results: resultsMode, clearEditor: false, },
            )}
            onQueryDelete={() => onQueryDelete(id)}
          />
        )) : null}
        {!items.length && NoResults}
      </div>
    </div>
  )
}

export default React.memo(WBResults)
