import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import JobsTree, { IProps } from './JobsTree'

const mockedProps = mock<IProps>()

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: null,
  }),
}))

describe('JobsTree', () => {
  it('should render', () => {
    expect(render(<JobsTree {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render loader', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
      error: '',
      data: null,
    })
    rdiPipelineSelector.mockImplementation(rdiPipelineSelectorMock)

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-jobs-loader')).toBeInTheDocument()
  })

  it('should render proper count of jobs', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      error: '',
      data: { jobs: [{ name: 'job1' }, { name: 'job2' }] },
    })
    rdiPipelineSelector.mockImplementation(rdiPipelineSelectorMock)

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-jobs-count')).toHaveTextContent('2')
  })

  it('should not render count of jobs if it is "0"', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      error: '',
      data: { jobs: [] },
    })
    rdiPipelineSelector.mockImplementation(rdiPipelineSelectorMock)

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-jobs-count')).toHaveTextContent('')
  })

  it('should call ', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      error: '',
      data: { jobs: [{ name: 'job1' }] },
    })
    rdiPipelineSelector.mockImplementation(rdiPipelineSelectorMock)

    const mockOnSelectedTab = jest.fn()

    render(<JobsTree {...instance(mockedProps)} onSelectedTab={mockOnSelectedTab} />)

    fireEvent.click(screen.getByTestId('rdi-nav-job-job1'))
    expect(mockOnSelectedTab).toBeCalledWith('job1')
  })
})
