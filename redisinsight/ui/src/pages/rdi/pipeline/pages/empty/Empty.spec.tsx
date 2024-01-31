import { useFormikContext } from 'formik'
import React from 'react'
import reactRouterDom from 'react-router-dom'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import Empty from './Empty'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false
  })
}))

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      config: null,
      jobs: []
    }
  })
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn().mockReturnValue({
    push: jest.fn
  })
}))

describe('Empty', () => {
  it('should render', () => {
    expect(render(<Empty />)).toBeTruthy()
  })

  it('should not render when pipeline is loading', () => {
    (rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      loading: true
    })

    render(<Empty />)

    expect(screen.queryByTestId('empty-pipeline')).toBeNull()
  })

  it('should render when pipeline is not loading', () => {
    render(<Empty />)

    expect(screen.getByTestId('empty-pipeline')).toBeInTheDocument()
  })

  it('should not render when pipeline config is not null', () => {
    (useFormikContext as jest.Mock).mockReturnValueOnce({
      values: {
        config: 'config',
        jobs: []
      }
    })

    render(<Empty />)

    expect(screen.queryByTestId('empty-pipeline')).toBeNull()
  })

  it('should not render when pipeline has jobs', () => {
    (useFormikContext as jest.Mock).mockReturnValueOnce({
      values: {
        config: null,
        jobs: [{ name: 'job1', value: 'value' }]
      }
    })

    render(<Empty />)

    expect(screen.queryByTestId('empty-pipeline')).toBeNull()
  })

  it('should call useHistory when button is clicked', async () => {
    const useHistoryMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: useHistoryMock })

    render(<Empty />)

    await act(() => {
      fireEvent.click(screen.getByTestId('create-pipeline-btn'))
    })

    expect(useHistoryMock).toHaveBeenCalledTimes(1)
    expect(useHistoryMock).toHaveBeenCalledWith('/integrate/rdiInstanceId/pipeline/prepare')
  })

  it('should render upload modal when upload button is clicked', async () => {
    render(<Empty />)

    await act(() => {
      fireEvent.click(screen.getByTestId('upload-pipeline-btn'))
    })

    expect(screen.getByTestId('import-file-modal')).toBeInTheDocument()
  })

  it('should have "Read More" button link to the correct docs page', async () => {
    render(<Empty />)

    expect(screen.getByTestId('read-more-btn').getAttribute('href')).toBe(
      'https://docs.redis.com/rdi-preview/rdi/data-transformation/data-transformation-pipeline/'
    )
  })
})
