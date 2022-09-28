import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  DBAnalysisSelector,
  DBAnalysisReportsSelector,
  fetchDBAnalysisAction,
  fetchDBAnalysisReportsHistory,
  setSelectedAnalysisId
} from 'uiSrc/slices/analytics/dbAnalysis'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import DatabaseAnalysisPage from './DatabaseAnalysisPage'

jest.mock('uiSrc/slices/analytics/dbAnalysis', () => ({
  ...jest.requireActual('uiSrc/slices/analytics/dbAnalysis'),
  fetchDBAnalysisReportsHistory: jest.fn(),
  DBAnalysisSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: null,
    history: {
      loading: false,
      error: '',
      data: [],
      selectedAnalysis: null,
    }
  }),
}))

describe('DatabaseAnalysisPage', () => {
  it('should call fetchDBAnalysisReportsHistory after rendering', async () => {
    const fetchDBAnalysisReportsHistoryMock = jest.fn();
    (fetchDBAnalysisReportsHistory as jest.Mock).mockImplementation(() => fetchDBAnalysisReportsHistoryMock)

    expect(render(<DatabaseAnalysisPage />)).toBeTruthy()
    expect(fetchDBAnalysisReportsHistoryMock).toBeCalled()
  })
})
