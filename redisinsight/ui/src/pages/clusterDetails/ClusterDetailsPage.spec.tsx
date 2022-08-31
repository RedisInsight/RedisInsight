import React from 'react'
import { fetchClusterDetailsAction } from 'uiSrc/slices/analytics/clusterDetails'
import { render } from 'uiSrc/utils/test-utils'

import ClusterDetailsPage from './ClusterDetailsPage'

jest.mock('uiSrc/slices/analytics/clusterDetails', () => ({
  ...jest.requireActual('uiSrc/slices/analytics/clusterDetails'),
  fetchClusterDetailsAction: jest.fn(),
  clusterDetailsSelector: jest.fn().mockReturnValue({
    data: [],
    loading: false,
    error: '',
  }),
}))

describe('ClusterDetailsPage', () => {
  it('should render', () => {
    const fetchClusterDetailsActionMock = jest.fn();
    (fetchClusterDetailsAction as jest.Mock).mockImplementation(() => fetchClusterDetailsActionMock)
    expect(render(<ClusterDetailsPage />)).toBeTruthy()
  })

  it('should call fetchClusterDetailsAction after rendering', async () => {
    const fetchClusterDetailsActionMock = jest.fn();
    (fetchClusterDetailsAction as jest.Mock).mockImplementation(() => fetchClusterDetailsActionMock)

    render(<ClusterDetailsPage />)
    expect(fetchClusterDetailsActionMock).toBeCalled()
  })
})
