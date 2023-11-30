import { cloneDeep } from 'lodash'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'

import { cleanup, mockedStore, render, act } from 'uiSrc/utils/test-utils'
import { resetKeys, resetPatternKeysData } from 'uiSrc/slices/browser/keys'
import { setMonitorInitialState } from 'uiSrc/slices/cli/monitor'
import { setInitialPubSubState } from 'uiSrc/slices/pubsub/pubsub'
import { setBulkActionsInitialState } from 'uiSrc/slices/browser/bulkActions'
import {
  appContextSelector,
  setAppContextConnectedInstanceId,
  setAppContextInitialState,
  setDbConfig
} from 'uiSrc/slices/app/context'
import { resetCliHelperSettings } from 'uiSrc/slices/cli/cli-settings'
import { resetRedisearchKeysData, setRedisearchInitialState } from 'uiSrc/slices/browser/redisearch'
import { setClusterDetailsInitialState } from 'uiSrc/slices/analytics/clusterDetails'
import { setDatabaseAnalysisInitialState } from 'uiSrc/slices/analytics/dbAnalysis'
import { setInitialAnalyticsSettings } from 'uiSrc/slices/analytics/settings'
import { getRecommendations, resetRecommendationsHighlighting } from 'uiSrc/slices/recommendations/recommendations'
import { setTriggeredFunctionsInitialState } from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import {
  getDatabaseConfigInfo,
  setConnectedInfoInstance,
  setConnectedInstance,
  setDefaultInstance
} from 'uiSrc/slices/instances/instances'
import InstancePage, { Props } from './InstancePage'

const INSTANCE_ID_MOCK = 'instanceId'
const mockedProps = mock<Props>()

jest.mock('uiSrc/services', () => ({
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    insightsRecommendations: {
      flag: false
    }
  }),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextSelector: jest.fn().mockReturnValue({
    contextInstanceId: INSTANCE_ID_MOCK
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * InstancePage tests
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

  it('should render with CLI Header Minimized Component', () => {
    const { queryByTestId } = render(
      <BrowserRouter>
        <InstancePage {...instance(mockedProps)} />
      </BrowserRouter>
    )

    expect(queryByTestId('expand-cli')).toBeInTheDocument()
  })

  it('should call proper actions with resetting context', async () => {
    (appContextSelector as jest.Mock).mockReturnValue({
      contextInstanceId: 'prevId'
    })

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
      resetRecommendationsHighlighting(),
      setTriggeredFunctionsInitialState(),
    ]

    const expectedActions = [
      setDefaultInstance(),
      setConnectedInstance(),
      getDatabaseConfigInfo(),
      setConnectedInfoInstance(),
      getRecommendations(),
      ...resetContextActions,
      setAppContextConnectedInstanceId(INSTANCE_ID_MOCK),
      setDbConfig(undefined),
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
  })
})
