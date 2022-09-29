import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { getDBAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { cleanup, mockedStore, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import Header, { Props, getFormatTime } from './Header'

const mockedProps = mock<Props>()

const mockReports = [
  { id: 'id_1', createdAt: '2022-09-23T05:30:23.000Z' },
  { id: 'id_2', createdAt: '2022-09-23T05:15:19.000Z' }
]

const mockProgress = {
  total: 10,
  scanned: 10,
  processed: 10
}

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('DatabaseAnalysisHeader', () => {
  it('should render', () => {
    expect(render(<Header {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should not render progress', () => {
    const { queryByTestId } = render(<Header {...instance(mockedProps)} items={mockReports} progress={undefined} />)

    expect(queryByTestId('analysis-progress')).not.toBeInTheDocument()
  })

  it('should render progress', () => {
    render(<Header {...instance(mockedProps)} items={mockReports} progress={mockProgress} />)

    expect(screen.getByTestId('analysis-progress')).toBeInTheDocument()
  })
  it('should "getDBAnalysis" action be called after click "start-database-analysis-btn"', () => {
    render(<Header {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('start-database-analysis-btn'))

    const expectedActions = [getDBAnalysis()]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
