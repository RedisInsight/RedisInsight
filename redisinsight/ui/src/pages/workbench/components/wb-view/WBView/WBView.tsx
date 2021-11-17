import React, { Ref, useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiResizableContainer } from '@elastic/eui'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'

import { Nullable } from 'uiSrc/utils'
import InstanceHeader from 'uiSrc/components/instance-header'
import QueryWrapper from 'uiSrc/components/query'
import { WBHistoryObject } from 'uiSrc/pages/workbench/interfaces'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import {
  setWorkbenchHorizontalPanelSizes,
  setWorkbenchVerticalPanelSizes,
  appContextWorkbench
} from 'uiSrc/slices/app/context'

import WBResultsWrapper from '../../wb-results'
import EnablementAreaWrapper from '../../enablament-area'

import styles from './styles.module.scss'

const verticalPanelIds = {
  firstPanelId: 'scriptingArea',
  secondPanelId: 'resultsArea'
}

const horizontalPanelIds = {
  firstPanelId: 'enablementArea',
  secondPanelId: 'workbenchArea'
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
  const { panelSizes: { horizontal, vertical } } = useSelector(appContextWorkbench)

  const horizontalSizesRef = useRef(horizontal)
  const verticalSizesRef = useRef(vertical)
  const isCollapsed = useRef(false)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setWorkbenchVerticalPanelSizes(verticalSizesRef.current))
    dispatch(setWorkbenchHorizontalPanelSizes(horizontalSizesRef.current))
  }, [])

  const onHorizontalPanelWidthChange = useCallback((newSizes: any) => {
    if (isCollapsed.current) {
      return
    }
    horizontalSizesRef.current = newSizes
  }, [])

  const onVerticalPanelWidthChange = useCallback((newSizes: any) => {
    verticalSizesRef.current = newSizes
  }, [])

  return (
    <div className={cx('workbenchPage', styles.container)}>
      <InstanceHeader />
      <div className={styles.main}>
        <EuiResizableContainer onPanelWidthChange={onHorizontalPanelWidthChange}>
          {(EuiResizablePanel, EuiResizableButton) => (
            <>
              <EuiResizablePanel
                id={horizontalPanelIds.firstPanelId}
                mode="collapsible"
                className={cx(styles.sidebar, styles.sidebarPanel)}
                initialSize={horizontal[horizontalPanelIds.firstPanelId] ?? 25}
                minSize="250px"
                onToggleCollapsed={() => { isCollapsed.current = !isCollapsed.current }}
                data-test-subj="resize-container-preselects-area"
              >
                <EnablementAreaWrapper setScript={setScript} scriptEl={scriptEl} />
              </EuiResizablePanel>
              <EuiResizableButton
                className={styles.resizeButton}
                data-test-subj="resize-btn-preselects-area"
              />
              <EuiResizablePanel
                className={cx(styles.content, styles.contentPanel)}
                mode="main"
                initialSize={horizontal[horizontalPanelIds.secondPanelId] ?? 75}
                minSize="75%"
                id={horizontalPanelIds.secondPanelId}
                scrollable={false}
              >
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
              </EuiResizablePanel>
            </>
          )}
        </EuiResizableContainer>
      </div>
    </div>
  )
}

export default WBView
