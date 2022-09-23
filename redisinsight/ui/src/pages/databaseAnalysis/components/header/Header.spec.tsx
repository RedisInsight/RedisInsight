import React from 'react'
import { instance, mock } from 'ts-mockito'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { render, screen } from 'uiSrc/utils/test-utils'

import Header, { Props, getFormatTime } from './Header'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  slowLogSelector: jest.fn().mockReturnValue({
    data: [],
    config: null,
    loading: false,
  }),
}))

const mockReports = [
  { id: 'id_1', createdAt: '2022-09-23T05:30:23.000Z' },
  { id: 'id_2', createdAt: '2022-09-23T05:15:19.000Z' }]

const mockedData = [
  {
    id: 0,
    time: 1652429583,
    durationUs: 56,
    args: 'info',
    source: '0.0.0.1:50834',
    client: 'redisinsight-common-0'
  },
  {
    id: 1,
    time: 1652429583,
    durationUs: 11,
    args: 'config get slowlog*',
    source: '0.0.0.1:50834',
    client: 'redisinsight-common-0'
  }
]

describe('SlowLogPage', () => {
  it('should render', () => {
    expect(render(<Header {...instance(mockedProps)} />)).toBeTruthy()
  })

  // it('should render empty slow log with empty data', () => {
  //   (slowLogSelector as jest.Mock).mockImplementation(() => ({
  //     data: [],
  //     config: null,
  //     loading: false,
  //   }))

  //   render(<SlowLogPage />)
  //   expect(screen.getByTestId('empty-slow-log')).toBeTruthy()
  // })

  it('should render selector without options', () => {
    render(<Header {...instance(mockedProps)} reports={mockReports} />)

    const { container } = render(<Header {...instance(mockedProps)} reports={mockReports} />)

    const reportOption = container.querySelector('[data-test-subj="reports-report-id_1"]')

    expect(reportOption).toBeTruthy()
    // expect(githubBtn?.getAttribute('href')).toEqual(EXTERNAL_LINKS.githubRepo)
  })
})

const getTimeTests = [
  {
    input: '2022-09-23T05:15:19.000Z',
    expected: '23 Sep 2022 09:15'
  }
]

describe('getFormatTime', () => {
  test.each(getTimeTests)(
    '%j',
    ({ input, expected }) => {
      const result = getFormatTime(input)
      expect(result).toEqual(expected)
    }
  )
})
