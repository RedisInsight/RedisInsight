import React from 'react'
import { fetchDBAnalysisReportsHistory } from 'uiSrc/slices/analytics/dbAnalysis'
import { render } from 'uiSrc/utils/test-utils'

import DatabaseAnalysisPage from './DatabaseAnalysisPage'

jest.mock('uiSrc/slices/analytics/dbAnalysis', () => ({
  ...jest.requireActual('uiSrc/slices/analytics/dbAnalysis'),
  fetchDBAnalysisReportsHistory: jest.fn(),
}))

/**
 * DatabaseAnalysisPage tests
 *
 * @group component
 */
describe('DatabaseAnalysisPage', () => {
  it('should call fetchDBAnalysisReportsHistory after rendering', async () => {
    const fetchDBAnalysisReportsHistoryMock = jest.fn();
    (fetchDBAnalysisReportsHistory as jest.Mock).mockImplementation(() => fetchDBAnalysisReportsHistoryMock)

    expect(render(<DatabaseAnalysisPage />)).toBeTruthy()
    expect(fetchDBAnalysisReportsHistoryMock).toBeCalled()
  })
})
