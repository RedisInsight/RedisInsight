import { isNull } from 'lodash'
import React from 'react'
import { EuiLoadingContent } from '@elastic/eui'
import { isGroupResults, Maybe } from 'uiSrc/utils'
import QueryCardCommonResult, { CommonErrorResponse } from 'uiSrc/components/query/query-card/QueryCardCommonResult'
import QueryCardCliResultWrapper from 'uiSrc/components/query/query-card/QueryCardCliResultWrapper'
import { CommandExecutionResult, ResultsMode } from 'uiSrc/slices/interfaces'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import QueryCardCliPlugin from 'uiSrc/components/query/query-card/QueryCardCliPlugin'
import styles from 'uiSrc/components/query/query-card/styles.module.scss'
import { Props } from './query-card.types'

type QueryCardBodyProps = {
  isFullScreen: boolean;
  setMessage: (value: string) => void;
  viewTypeSelected: WBQueryType;
  selectedViewValue: string;
}

const isSizeLimitExceededResponse = (result: Maybe<CommandExecutionResult[]>) => {
  const resultObj = result?.[0]
  // response.includes - to be backward compatible with responses which don't include sizeLimitExceeded flag
  return resultObj?.sizeLimitExceeded === true || resultObj?.response?.includes?.('Results have been deleted')
}

export const QueryCardBody = (props: Props & QueryCardBodyProps) => {
  const {
    id,
    command = '',
    result,
    mode,
    resultsMode,
    isOpen,
    loading,
    isNotStored,
    db,
    isFullScreen,
    setMessage,
    selectedViewValue,
    viewTypeSelected,
  } = props

  const commonError = CommonErrorResponse(id, command, result)

  if (!isOpen) {
    return null
  }

  if (React.isValidElement(commonError) && (!isGroupResults(resultsMode) || isNull(command))) {
    return <QueryCardCommonResult loading={loading} result={commonError} />
  }

  if (isSizeLimitExceededResponse(result)) {
    return (
      <QueryCardCliResultWrapper
        loading={loading}
        query={command || ''}
        resultsMode={resultsMode}
        result={result}
        isNotStored={isNotStored}
        isFullScreen={isFullScreen}
      />
    )
  }

  return (
    <>
      {isGroupResults(resultsMode) && (
        <QueryCardCliResultWrapper
          loading={loading}
          query={command || ''}
          db={db}
          resultsMode={resultsMode}
          result={result}
          isNotStored={isNotStored}
          isFullScreen={isFullScreen}
          data-testid="group-mode-card"
        />
      )}
      {(resultsMode === ResultsMode.Default || !resultsMode) && (
        <>
          {viewTypeSelected === WBQueryType.Plugin && (
            <>
              {!loading && result !== undefined ? (
                <QueryCardCliPlugin
                  id={selectedViewValue}
                  result={result}
                  query={command}
                  mode={mode}
                  setMessage={setMessage}
                  commandId={id}
                />
              ) : (
                <div className={styles.loading}>
                  <EuiLoadingContent lines={5} data-testid="loading-content" />
                </div>
              )}
            </>
          )}
          {(viewTypeSelected === WBQueryType.Text) && (
            <QueryCardCliResultWrapper
              loading={loading}
              query={command || ''}
              resultsMode={resultsMode}
              result={result}
              isNotStored={isNotStored}
              isFullScreen={isFullScreen}
            />
          )}
        </>
      )}
    </>
  )
}
