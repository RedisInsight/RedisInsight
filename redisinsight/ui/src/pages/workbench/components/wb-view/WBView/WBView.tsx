import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiResizableContainer } from '@elastic/eui'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'

import { Nullable } from 'uiSrc/utils'
import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import InstanceHeader from 'uiSrc/components/instance-header'
import QueryWrapper from 'uiSrc/components/query'
import { WBHistoryObject } from 'uiSrc/pages/workbench/interfaces'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import {
  setWorkbenchVerticalPanelSizes,
  appContextWorkbench
} from 'uiSrc/slices/app/context'

import WBResultsWrapper from '../../wb-results'
import EnablementAreaWrapper from '../../enablement-area'

import styles from './styles.module.scss'

const verticalPanelIds = {
  firstPanelId: 'scriptingArea',
  secondPanelId: 'resultsArea'
}

export interface Props {
  script: string;
  loading: boolean;
  historyItems: Array<WBHistoryObject>;
  setScript: (script: string) => void;
  setScriptEl: Function;
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>;
  scrollDivRef: Ref<HTMLDivElement>;
  onSubmit: (query?: string, historyId?: number, type?: WBQueryType) => void;
  onQueryDelete: (historyId: number) => void
}

const WBView = (props: Props) => {
  const { script = '', loading, setScript, setScriptEl,
    scriptEl, onSubmit, onQueryDelete, scrollDivRef, historyItems } = props
  const [isMinimized, setIsMinimized] = useState<boolean>(
    (localStorageService?.get(BrowserStorageItem.isEnablementAreaMinimized) ?? 'false') === 'true'
  )

  const { panelSizes: { vertical } } = useSelector(appContextWorkbench)

  const verticalSizesRef = useRef(vertical)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setWorkbenchVerticalPanelSizes(verticalSizesRef.current))
  }, [])

  useEffect(() => {
    localStorageService.set(BrowserStorageItem.isEnablementAreaMinimized, isMinimized)
  }, [isMinimized])

  const onVerticalPanelWidthChange = useCallback((newSizes: any) => {
    verticalSizesRef.current = newSizes
  }, [])

  return (
    <div className={cx('workbenchPage', styles.container)}>
      <InstanceHeader />
      <div className={styles.main}>
        <div className={cx(styles.sidebar, { [styles.minimized]: isMinimized })}>
          <EnablementAreaWrapper
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            setScript={setScript}
            scriptEl={scriptEl}
          />
        </div>
        <div className={cx(styles.content, { [styles.minimized]: isMinimized })}>
          <EuiResizableContainer onPanelWidthChange={onVerticalPanelWidthChange} direction="vertical" style={{ height: '100%' }}>
            {(EuiResizablePanel, EuiResizableButton) => (
              <>
                <EuiResizablePanel
                  id={verticalPanelIds.firstPanelId}
                  minSize="140px"
                  paddingSize="none"
                  scrollable={false}
                  className={styles.queryPanel}
                  initialSize={vertical[verticalPanelIds.firstPanelId] ?? 20}
                  style={{ minHeight: '140px' }}
                >
                  <QueryWrapper
                    query={script}
                    loading={loading}
                    setQuery={setScript}
                    setQueryEl={setScriptEl}
                    onSubmit={onSubmit}
                  />
                </EuiResizablePanel>

                <EuiResizableButton
                  className={styles.resizeButton}
                  data-test-subj="resize-btn-scripting-area-and-results"
                />

                <EuiResizablePanel
                  id={verticalPanelIds.secondPanelId}
                  minSize="60px"
                  paddingSize="none"
                  scrollable={false}
                  initialSize={vertical[verticalPanelIds.secondPanelId] ?? 80}
                  className={cx(styles.queryResults, styles.queryResultsPanel)}
                  // Fix scroll on low height - 140px (queryPanel)
                  style={{ maxHeight: 'calc(100% - 140px)' }}
                >
                  <WBResultsWrapper
                    historyItems={historyItems}
                    scrollDivRef={scrollDivRef}
                    onQueryRun={onSubmit}
                    onQueryDelete={onQueryDelete}
                  />
                </EuiResizablePanel>
              </>
            )}
          </EuiResizableContainer>
        </div>
      </div>
    </div>
  )
}

export default WBView
