import { cloneDeep } from 'lodash'
import React from 'react'
import reactRouterDom, { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'

import { cleanup, mockedStore, render, act } from 'uiSrc/utils/test-utils'
import { resetKeys, resetPatternKeysData } from 'uiSrc/slices/browser/keys'
import { setMonitorInitialState } from 'uiSrc/slices/cli/monitor'
import { setInitialPubSubState } from 'uiSrc/slices/pubsub/pubsub'
import { setBulkActionsInitialState } from 'uiSrc/slices/browser/bulkActions'
import {
  appContextSelector, resetPipelineManagement,
  setAppContextConnectedRdiInstanceId,
  setAppContextInitialState,
} from 'uiSrc/slices/app/context'
import { resetCliHelperSettings } from 'uiSrc/slices/cli/cli-settings'
import { resetRedisearchKeysData, setRedisearchInitialState } from 'uiSrc/slices/browser/redisearch'
import { setClusterDetailsInitialState } from 'uiSrc/slices/analytics/clusterDetails'
import { setDatabaseAnalysisInitialState } from 'uiSrc/slices/analytics/dbAnalysis'
import { setInitialAnalyticsSettings } from 'uiSrc/slices/analytics/settings'
import { setInitialRecommendationsState } from 'uiSrc/slices/recommendations/recommendations'
import { setTriggeredFunctionsInitialState } from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import {
  resetConnectedInstance as resetConnectedDatabaseInstance,
} from 'uiSrc/slices/instances/instances'
import { setConnectedInstance } from 'uiSrc/slices/rdi/instances'
import { PageNames, Pages } from 'uiSrc/constants'
import { setPipelineInitialState } from 'uiSrc/slices/rdi/pipeline'

import InstancePage, { Props } from './InstancePage'

const RDI_INSTANCE_ID_MOCK = 'rdiInstanceId'
const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextSelector: jest.fn().mockReturnValue({
    contextRdiInstanceId: RDI_INSTANCE_ID_MOCK
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * Rdi InstancePage tests
 *
 * @group component
 */
describe('InstancePage', () => {
  it('should render', () => {
    expect(
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>
      )
    ).toBeTruthy()
  })

  it('should call proper actions with resetting context', async () => {
    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>
      )
    })

    const resetContextActions = [
      resetKeys(),
      setMonitorInitialState(),
      setInitialPubSubState(),
      setBulkActionsInitialState(),
      setAppContextInitialState(),
      resetPatternKeysData(),
      resetCliHelperSettings(),
      resetRedisearchKeysData(),
      setClusterDetailsInitialState(),
      setDatabaseAnalysisInitialState(),
      setInitialAnalyticsSettings(),
      setRedisearchInitialState(),
      setInitialRecommendationsState(),
      setTriggeredFunctionsInitialState(),
      setConnectedInstance(),
    ]

    const expectedActions = [
      setAppContextConnectedRdiInstanceId('rdiInstanceId'),
      resetConnectedDatabaseInstance(),
      ...resetContextActions,
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should fetch rdi instance info', async () => {
    (appContextSelector as jest.Mock).mockReturnValue({
      contextRdiInstanceId: 'prevId'
    })

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>
      )
    })

    const expectedActions = [
      setAppContextConnectedRdiInstanceId(''),
      setPipelineInitialState(),
      resetPipelineManagement(),
      setConnectedInstance()
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
  })

  it('should redirect to rdi pipeline management page', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.rdiPipeline(RDI_INSTANCE_ID_MOCK) })

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>
      )
    })

    expect(pushMock).toBeCalledWith(Pages.rdiPipelineManagement(RDI_INSTANCE_ID_MOCK))
  })

  it('should redirect to rdi pipeline statistics page', async () => {
    (appContextSelector as jest.Mock).mockReturnValue({
      contextRdiInstanceId: RDI_INSTANCE_ID_MOCK,
      lastPage: PageNames.rdiStatistics,
    })

    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.rdiPipeline(RDI_INSTANCE_ID_MOCK) })

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>
      )
    })

    expect(pushMock).toBeCalledWith(Pages.rdiStatistics(RDI_INSTANCE_ID_MOCK))
  })
})
