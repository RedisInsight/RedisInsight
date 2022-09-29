import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import AnalysisDataView, { Props } from './AnalysisDataView'

const mockedProps = mock<Props>()

const mockReports = [
  { id: 'id_1', createdAt: '2022-09-23T05:30:23.000Z' },
  { id: 'id_2', createdAt: '2022-09-23T05:15:19.000Z' }
]

const mockData = {
  id: 'id',
  totalKeys: { total: 0, types: [] },
}

/**
 * AnalysisDataView tests
 *
 * @group unit
 */
describe('AnalysisDataView', () => {
  it('should render', () => {
    expect(render(<AnalysisDataView {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render only table when loading="true"', () => {
    const { queryByTestId } = render(<AnalysisDataView {...instance(mockedProps)} loading />)

    expect(queryByTestId('empty-analysis-no-reports')).not.toBeInTheDocument()
    expect(queryByTestId('empty-analysis-no-keys')).not.toBeInTheDocument()
  })

  it('should render empty-data-message-no-keys when total=0 ', () => {
    const { queryByTestId } = render(
      <AnalysisDataView {...instance(mockedProps)} reports={mockReports} data={mockData} />
    )

    expect(queryByTestId('empty-analysis-no-reports')).not.toBeInTheDocument()
    expect(queryByTestId('empty-analysis-no-keys')).toBeInTheDocument()
  })

  it('should render empty-data-message-no-reports when reports=[] ', () => {
    const { queryByTestId } = render(
      <AnalysisDataView {...instance(mockedProps)} reports={[]} />
    )

    expect(queryByTestId('empty-analysis-no-reports')).toBeInTheDocument()
    expect(queryByTestId('empty-analysis-no-keys')).not.toBeInTheDocument()
  })
})
