import React, { useContext } from 'react'
import cx from 'classnames'
import { EuiButtonEmpty, EuiIcon, EuiText } from '@elastic/eui'

import { Theme } from 'uiSrc/constants'
import { ProfileQueryType } from 'uiSrc/pages/workbench/constants'
import { generateProfileQueryForCommand } from 'uiSrc/pages/workbench/utils'
import { CodeButtonParams } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { Nullable } from 'uiSrc/utils'
import QueryCard from 'uiSrc/components/query-card'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import MultiPlayIconDark from 'uiSrc/assets/img/multi_play_icon_dark.svg'
import MultiPlayIconLight from 'uiSrc/assets/img/multi_play_icon_light.svg'
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
      <EuiIcon
        type={theme === Theme.Dark ? MultiPlayIconDark : MultiPlayIconLight}
        className={styles.playIcon}
        data-testid="wb_no-results__icon"
      />
      <EuiText className={styles.noResultsTitle} color="subdued" data-testid="wb_no-results__title">No results to display</EuiText>
      <EuiText className={styles.noResultsText} color="subdued" data-testid="wb_no-results__summary">
        Run Redis commands to get results or see the left menu to learn more
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
    <div className={cx(styles.container)}>
      {!!items.length && (
        <div className={styles.header}>
          <EuiButtonEmpty
            size="s"
            iconType="trash"
            iconSize="s"
            className={styles.clearAllBtn}
            onClick={() => onAllQueriesDelete?.()}
            disabled={clearing || processing}
            data-testid="clear-history-btn"
          >
            Clear Results
          </EuiButtonEmpty>
        </div>
      )}
      <div ref={scrollDivRef} />
      {items.map((
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
      ))}
      {!items.length && NoResults}
    </div>
  )
}

export default React.memo(WBResults)
