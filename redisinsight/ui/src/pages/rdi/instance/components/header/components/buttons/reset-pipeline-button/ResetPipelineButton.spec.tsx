import React from 'react'

import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import ResetPipelineButton, { PipelineButtonProps } from './ResetPipelineButton'

const mockedProps: PipelineButtonProps = {
  loading: false,
  disabled: false,
  onClick: jest.fn(),
}

describe('ResetPipelineButton', () => {
  it('should render', () => {
    expect(render(<ResetPipelineButton {...mockedProps} />)).toBeTruthy()
  })

  it('should show reset info text when hovered', async () => {
    render(<ResetPipelineButton {...mockedProps} />)

    fireEvent.mouseOver(screen.getByTestId('reset-pipeline-btn'))
    await waitFor(() => screen.getByText(/flushing the target Redis database/))
    expect(screen.getByText(/flushing the target Redis database/)).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = jest.fn()
    render(<ResetPipelineButton {...mockedProps} onClick={onClick} />)

    fireEvent.click(screen.getByTestId('reset-pipeline-btn'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not be clickable event, when disabled || loading', () => {
    const onClick = jest.fn()
    render(<ResetPipelineButton {...mockedProps} disabled onClick={onClick} />)

    fireEvent.click(screen.getByTestId('reset-pipeline-btn'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should not be clickable event, when loading', () => {
    const onClick = jest.fn()
    render(<ResetPipelineButton {...mockedProps} loading onClick={onClick} />)

    fireEvent.click(screen.getByTestId('reset-pipeline-btn'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
