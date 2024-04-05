import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiToolTip,
  EuiSpacer,
  EuiText,
  EuiCollapsibleNavGroup,
  EuiLoadingContent,
  EuiTabs,
  EuiTab,
  EuiProgress,
  EuiLink
} from '@elastic/eui'
import cx from 'classnames'
import { isNil } from 'lodash'
import {
  fetchTriggeredFunctionsLibrary,
  replaceTriggeredFunctionsLibraryAction, setSelectedFunctionToShow,
  triggeredFunctionsSelectedLibrarySelector
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'

import { MonacoJS, MonacoJson } from 'uiSrc/components/monaco-editor'
import DeleteLibraryButton from 'uiSrc/pages/triggered-functions/pages/Libraries/components/DeleteLibrary'
import { reSerializeJSON } from 'uiSrc/utils/formatters/json'
import { FunctionType } from 'uiSrc/slices/interfaces/triggeredFunctions'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { formatLongName, Nullable } from 'uiSrc/utils'

import {
  LIB_DETAILS_TABS,
  LibDetailsSelectedView,
  LIST_OF_FUNCTION_TYPES
} from 'uiSrc/pages/triggered-functions/constants'
import { Pages } from 'uiSrc/constants'
import { getFunctionsLengthByType } from 'uiSrc/utils/triggered-functions/utils'
import { AutoRefresh } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  name: string
  onClose: () => void
  onDeleteRow: (name: string) => void
}

const LibraryDetails = (props: Props) => {
  const { name, onClose, onDeleteRow } = props
  const { loading, lastRefresh, data: library } = useSelector(triggeredFunctionsSelectedLibrarySelector)

  const [selectedView, setSelectedView] = useState<string>(LIB_DETAILS_TABS[0].id)
  const [configuration, setConfiguration] = useState<string>('_')
  const [code, setCode] = useState<string>('_')
  const [popover, setPopover] = useState<Nullable<string>>(null)

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchTriggeredFunctionsLibrary(
      instanceId,
      name,
      (lib) => {
        sendEventTelemetry({
          event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_VIEWED,
          eventData: {
            databaseId: instanceId,
            pendingJobs: lib?.pendingJobs || 0,
            apiVersion: lib?.apiVersion || '1.0',
            configLoaded: !isNil(lib?.code) || false,
            functions: {
              total: lib?.functions.length || 0,
              ...getFunctionsLengthByType(lib?.functions)
            }
          }
        })
      }
    ))
  }, [name])

  useEffect(() => {
    // set first values, to clear selection after lib will be fetched
    // https://github.com/react-monaco-editor/react-monaco-editor/issues/539
    if (!library) {
      setCode('_')
      setConfiguration('_')
      return
    }

    setConfiguration(reSerializeJSON(library.configuration ?? '', 2))
    setCode(library.code)
  }, [library])

  const handleRefresh = () => {
    dispatch(fetchTriggeredFunctionsLibrary(instanceId, name))
  }

  const handleRefreshClicked = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DETAILS_REFRESH_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const handleEnableAutoRefresh = (enableAutoRefresh: boolean, refreshRate: string) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DETAILS_AUTO_REFRESH_ENABLED
        : TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DETAILS_AUTO_REFRESH_DISABLED,
      eventData: {
        databaseId: instanceId,
        refreshRate
      }
    })
  }

  const handleApply = (_e: React.MouseEvent, closeEditor: () => void) => {
    dispatch(replaceTriggeredFunctionsLibraryAction(instanceId, code, configuration, () => {
      closeEditor()
      sendEventTelemetry({
        event: selectedView === LibDetailsSelectedView.Code
          ? TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_CODE_REPLACED
          : TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_CONFIGURATION_REPLACED,
        eventData: {
          databaseId: instanceId,
        }
      })
    }))
  }

  const handleDecline = () => {
    setConfiguration(reSerializeJSON(library?.configuration ?? '', 2))
    setCode(library?.code ?? '')
  }

  const handleDeleteClick = (library: string) => {
    setPopover(library)
  }

  const handleClosePopover = () => {
    setPopover(null)
  }

  const goToFunction = (
    e: React.MouseEvent,
    { functionName, type }: { functionName: string, type: FunctionType }
  ) => {
    e.preventDefault()
    dispatch(setSelectedFunctionToShow({
      name: functionName,
      type,
      library: name
    }))
    history.push(Pages.triggeredFunctionsFunctions(instanceId))
  }

  const functionGroup = (title: string, list: Array<{ type: FunctionType, name: string }>, initialIsOpen = false) => {
    const count = list.length > 0 ? `(${list.length})` : ''
    return (
      <EuiCollapsibleNavGroup
        key={title}
        isCollapsible
        className={styles.accordion}
        title={`${title} ${count}`}
        initialIsOpen={initialIsOpen}
        paddingSize="none"
        titleElement="span"
        data-testid={`functions-${title}`}
      >
        {list.length ? (
          <ul className={styles.list}>
            {list.map(({ name, type }) => (
              <li
                className={styles.listItem}
                key={name}
                data-testid={`func-${name}`}
              >
                <EuiLink
                  href="#"
                  onClick={(e: React.MouseEvent) => goToFunction(e, { functionName: name, type })}
                  data-testid={`moveToFunction-${name}`}
                >
                  {name}
                </EuiLink>
              </li>
            ))}
          </ul>
        ) : (
          <i>Empty</i>
        )}
      </EuiCollapsibleNavGroup>
    )
  }

  const renderFunctionsLists = () => LIST_OF_FUNCTION_TYPES.map(({ title, type }) => {
    const functionsList = library?.functions?.filter(({ type: fType }: { type: FunctionType }) => type === fType) || []
    return functionGroup(title, functionsList, functionsList.length > 0)
  })

  const renderTabs = useCallback(() => LIB_DETAILS_TABS.map(({ id, label }) => (
    <EuiTab
      isSelected={selectedView === id}
      onClick={() => setSelectedView(id)}
      key={id}
      data-testid={`library-view-tab-${id}`}
      className={styles.tab}
    >
      {label}
    </EuiTab>
  )), [selectedView])

  return (
    <div className={styles.main} data-testid={`lib-details-${name}`}>
      <div className={styles.header}>
        <EuiToolTip
          title="Library Name"
          content={formatLongName(name)}
          anchorClassName={cx('truncateText', styles.titleTooltip)}
        >
          <EuiTitle size="xs" className={styles.libName} data-testid="lib-name"><span>{name}</span></EuiTitle>
        </EuiToolTip>
        <EuiSpacer size="xs" />
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false} gutterSize="none">
          <EuiFlexItem>
            {library?.apiVersion && (<EuiText color="subdued" data-testid="lib-apiVersion">API: {library.apiVersion}</EuiText>)}
          </EuiFlexItem>
          <EuiFlexItem style={{ alignSelf: 'flex-end' }} grow={false}>
            <div className={styles.actions}>
              <AutoRefresh
                loading={loading}
                postfix="library-details"
                displayText
                lastRefreshTime={lastRefresh}
                containerClassName={styles.refreshContainer}
                onRefresh={handleRefresh}
                onRefreshClicked={handleRefreshClicked}
                onEnableAutoRefresh={handleEnableAutoRefresh}
                testid="refresh-lib-details-btn"
              />
              <DeleteLibraryButton
                library={library}
                isOpen={popover === library?.name}
                openPopover={handleDeleteClick}
                closePopover={handleClosePopover}
                onDelete={onDeleteRow}
              />
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiToolTip
          content="Close"
          position="left"
          anchorClassName="triggeredFunctions__closeRightPanel"
        >
          <EuiButtonIcon
            iconType="cross"
            color="primary"
            aria-label="Close panel"
            className={styles.closeBtn}
            onClick={() => onClose()}
            data-testid="close-right-panel-btn"
          />
        </EuiToolTip>
      </div>
      <div className={styles.content}>
        {(loading && library) && (
          <EuiProgress
            color="primary"
            size="xs"
            position="absolute"
            data-testid="progress-library-details"
          />
        )}
        {(loading && !library) && (<EuiLoadingContent lines={4} />)}
        {library && (
          <>
            {renderFunctionsLists()}
            <EuiTabs>{renderTabs()}</EuiTabs>
            {selectedView === LibDetailsSelectedView.Code && (
              <MonacoJS
                readOnly
                isEditable
                value={code}
                onChange={setCode}
                onApply={handleApply}
                onDecline={handleDecline}
                wrapperClassName={styles.editorWrapper}
                data-testid="library-code"
              />
            )}
            {selectedView === LibDetailsSelectedView.Config && (
              <MonacoJson
                readOnly
                isEditable
                value={configuration}
                onChange={setConfiguration}
                onApply={handleApply}
                onDecline={handleDecline}
                wrapperClassName={styles.editorWrapper}
                data-testid="library-configuration"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default LibraryDetails
