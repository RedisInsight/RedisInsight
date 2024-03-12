import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { EuiResizableContainer } from '@elastic/eui'
import { useSelector } from 'react-redux'
import InstanceHeader from 'uiSrc/components/instance-header'
import { ExplorePanelTemplate } from 'uiSrc/templates'
import BottomGroupComponents from 'uiSrc/components/bottom-group-components/BottomGroupComponents'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { monitorSelector } from 'uiSrc/slices/cli/monitor'

import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import styles from './styles.module.scss'

export const firstPanelId = 'main-component'
export const secondPanelId = 'cli'

export interface ResizablePanelSize {
  [firstPanelId]: number
  [secondPanelId]: number
}

export interface Props {
  children: React.ReactNode
}

export const getDefaultSizes = () => {
  const storedSizes = localStorageService.get(BrowserStorageItem.cliResizableContainer)

  return (
    storedSizes || {
      [firstPanelId]: 60,
      [secondPanelId]: 40,
    }
  )
}

const InstancePageTemplate = (props: Props) => {
  const { children } = props
  const [sizes, setSizes] = useState<ResizablePanelSize>(getDefaultSizes())

  const { isShowCli, isShowHelper } = useSelector(cliSettingsSelector)
  const { isShowMonitor } = useSelector(monitorSelector)

  useEffect(() => () => {
    setSizes((prevSizes: ResizablePanelSize) => {
      localStorageService.set(BrowserStorageItem.cliResizableContainer, {
        [firstPanelId]: prevSizes[firstPanelId],
        // partially fix elastic resizable issue with zooming
        [secondPanelId]: 100 - prevSizes[firstPanelId],
      })
      return prevSizes
    })
  }, [])

  const onPanelWidthChange = useCallback((newSizes: any) => {
    setSizes((prevSizes: any) => ({
      ...prevSizes,
      ...newSizes,
    }))
  }, [])

  const isShowBottomGroup = isShowCli || isShowHelper || isShowMonitor
  return (
    <>
      <InstanceHeader />
      <EuiResizableContainer
        direction="vertical"
        onPanelWidthChange={onPanelWidthChange}
        className={cx(styles.resizableContainer, { 'show-cli': isShowBottomGroup })}
      >
        {(EuiResizablePanel, EuiResizableButton) => (
          <>
            <EuiResizablePanel
              id={firstPanelId}
              scrollable={false}
              minSize="55px"
              paddingSize="none"
              size={isShowBottomGroup ? sizes[firstPanelId] : 100}
              wrapperProps={{ className: cx(styles.panelTop, { [styles.mainComponent]: !isShowBottomGroup }) }}
              data-testid={firstPanelId}
            >
              <ExplorePanelTemplate>
                {children}
              </ExplorePanelTemplate>
            </EuiResizablePanel>

            <EuiResizableButton className={styles.resizableButton} data-test-subj="resize-btn-browser-cli" />

            <EuiResizablePanel
              id={secondPanelId}
              scrollable={false}
              size={isShowBottomGroup ? sizes[secondPanelId] : 0}
              style={{ zIndex: 9 }}
              minSize="140px"
              wrapperProps={{ className: cx(styles.panelBottom) }}
              data-testid={secondPanelId}
              paddingSize="none"
            >
              <BottomGroupComponents />
            </EuiResizablePanel>
          </>
        )}
      </EuiResizableContainer>
    </>
  )
}

export default InstancePageTemplate
