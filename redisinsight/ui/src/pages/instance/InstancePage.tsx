import { EuiResizableContainer } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  fetchInstanceAction,
  getDatabaseConfigInfoAction,
} from 'uiSrc/slices/instances'
import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import CliWrapper from 'uiSrc/components/cli/CliWrapper'
import { cliSettingsSelector, resetIsShowCli } from 'uiSrc/slices/cli/cli-settings'
import CliHeaderMinimized from 'uiSrc/components/cli/components/cli-header-minimized'
import {
  appContextSelector,
  setAppContextConnectedInstanceId,
  setAppContextInitialState,
} from 'uiSrc/slices/app/context'
import { resetOutput } from 'uiSrc/slices/cli/cli-output'
import InstancePageRouter from './InstancePageRouter'

import styles from './styles.module.scss'

export interface Props {
  routes: any[];
}

export const firstPanelId = 'main-component'
export const secondPanelId = 'cli'

export const getDefaultSizes = () => {
  const storedSizes = localStorageService.get(BrowserStorageItem.cliResizableContainer)

  return (
    storedSizes || {
      [firstPanelId]: 60,
      [secondPanelId]: 40,
    }
  )
}

const InstancePage = ({ routes = [] }: Props) => {
  const [sizes, setSizes] = useState(getDefaultSizes())

  const dispatch = useDispatch()
  const { instanceId: connectionInstanceId } = useParams<{ instanceId: string }>()
  const { isShowCli } = useSelector(cliSettingsSelector)
  const { contextInstanceId } = useSelector(appContextSelector)

  useEffect(() => {
    dispatch(fetchInstanceAction(connectionInstanceId))
    dispatch(getDatabaseConfigInfoAction(connectionInstanceId))

    if (contextInstanceId !== connectionInstanceId) {
      dispatch(setAppContextInitialState())
      dispatch(resetIsShowCli())
      dispatch(resetOutput())
    }

    dispatch(setAppContextConnectedInstanceId(connectionInstanceId))
  }, [])

  useEffect(() => () => {
    setSizes((prevSizes: any) => {
      localStorageService.set(BrowserStorageItem.cliResizableContainer, prevSizes)
    })
  }, [])

  const onPanelWidthChange = useCallback((newSizes: any) => {
    setSizes((prevSizes: any) => ({
      ...prevSizes,
      ...newSizes,
    }))
  }, [])

  return (
    <EuiResizableContainer
      direction="vertical"
      style={{ height: '100%' }}
      onPanelWidthChange={onPanelWidthChange}
      className={cx({ 'show-cli': isShowCli })}
    >
      {(EuiResizablePanel, EuiResizableButton) => (
        <>
          <EuiResizablePanel
            id={firstPanelId}
            scrollable={false}
            minSize="55px"
            paddingSize="none"
            size={isShowCli ? sizes[firstPanelId] : 100}
            wrapperProps={{ className: cx({ [styles.mainComponent]: !isShowCli }) }}
            data-testid={firstPanelId}
          >
            <InstancePageRouter routes={routes} />
          </EuiResizablePanel>

          <EuiResizableButton className={styles.resizableButton} data-test-subj="resize-btn-browser-cli" />

          <EuiResizablePanel
            id={secondPanelId}
            scrollable={false}
            size={isShowCli ? sizes[secondPanelId] : 0}
            style={{ zIndex: 10 }}
            minSize="70px"
            data-testid={secondPanelId}
            paddingSize="none"
          >
            {!isShowCli ? <CliHeaderMinimized /> : <CliWrapper />}
          </EuiResizablePanel>
        </>
      )}
    </EuiResizableContainer>
  )
}

export default InstancePage
