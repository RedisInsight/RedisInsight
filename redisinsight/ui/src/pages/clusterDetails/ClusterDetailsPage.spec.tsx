import { cloneDeep } from 'lodash'
import React from 'react'
import { CLUSTER_DETAILS_DATA_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'
import {
  getClusterDetails,
  getClusterDetailsSuccess
} from 'uiSrc/slices/analytics/clusterDetails'
import { act, cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'

import ClusterDetailsPage from './ClusterDetailsPage'

let store: typeof mockedStore

describe('ClusterDetailsPage', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })

  it('should render', async () => {
    await act(() => {
      expect(render(<ClusterDetailsPage />))
        .toBeTruthy()
    })
  })

  it('should call fetchClusterDetailsAction after rendering', async () => {
    await act(() => {
      render(<ClusterDetailsPage />)
    })

    const expectedActions = [getClusterDetails(), getClusterDetailsSuccess(CLUSTER_DETAILS_DATA_MOCK)]
    expect(store.getActions()).toEqual([...expectedActions])
  })
})
