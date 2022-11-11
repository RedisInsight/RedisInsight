import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { MOCK_ANALYSIS_REPORT_DATA } from 'uiSrc/mocks/data/analysis'
import { render, screen, mockedStore, cleanup, fireEvent } from 'uiSrc/utils/test-utils'
import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
import { setDatabaseAnalysisViewTab } from 'uiSrc/slices/analytics/dbAnalysis'

import DatabaseAnalysisTabs, { Props } from './DatabaseAnalysisTabs'

const mockedProps = mock<Props>()

const mockReports = [
  {
    id: MOCK_ANALYSIS_REPORT_DATA.id,
    createdAt: '2022-09-23T05:30:23.000Z'
  }
]

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('DatabaseAnalysisTabs', () => {
  it('should render', () => {
    expect(render(<DatabaseAnalysisTabs {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call setDatabaseAnalysisViewTab', () => {
    render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} />)

    fireEvent.click(screen.getByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`))

    const expectedActions = [setDatabaseAnalysisViewTab(DatabaseAnalysisViewTab.Recommendations)]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render encrypt message', () => {
    const mockData = {
      totalKeys: null
    }
    render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

    expect(screen.queryByTestId('empty-encrypt-wrapper')).toBeTruthy()
  })

  describe('recommendations count', () => {
    it('should render "Recommendation (3)" in the tab name', () => {
      const mockData = {
        recommendations: [
          { name: 'luaScript' },
          { name: 'luaScript' },
          { name: 'luaScript' },
        ]
      }

      render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

      expect(screen.queryByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`)).toHaveTextContent('Recommendations (3)')
    })

    it('should render "Recommendation (3)" in the tab name', () => {
      const mockData = {
        recommendations: [{ name: 'luaScript' }]
      }
      render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

      expect(screen.queryByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`)).toHaveTextContent('Recommendations (1)')
    })

    it('should render "Recommendation" in the tab name', () => {
      const mockData = {
        recommendations: []
      }
      render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

      expect(screen.queryByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`)).toHaveTextContent('Recommendations')
    })
  })
})
