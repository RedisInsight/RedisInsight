import React from 'react'
import { instance, mock } from 'ts-mockito'
import userEvent from '@testing-library/user-event'
import { render, screen } from 'uiSrc/utils/test-utils'
import { Props, KeyDetailsHeaderSizeLength } from './KeyDetailsHeaderSizeLength'

const mockedProps = mock<Props>()

jest.mock('react-redux', () => ({
  useSelector: jest.fn()
}))

describe('KeyDetailsHeaderSizeLength', () => {
  const mockProps: Props = {
    width: 1920
  }

  it('should render normal size correctly', () => {
    // Mock the Redux selector for normal size
    jest.spyOn(require('react-redux'), 'useSelector').mockReturnValue({
      type: 'string',
      size: 1024,
      length: 1
    })

    render(<KeyDetailsHeaderSizeLength {...mockProps} />)

    expect(screen.getByTestId('key-size-text')).toBeInTheDocument()
    expect(screen.queryByTestId('key-size-info-icon')).not.toBeInTheDocument()
  })

  it('should render too large size with warning icon', () => {
    // Mock the Redux selector for size too large
    jest.spyOn(require('react-redux'), 'useSelector').mockReturnValue({
      type: 'string',
      size: -1,
      length: 1
    })

    render(<KeyDetailsHeaderSizeLength {...mockProps} />)

    expect(screen.getByTestId('key-size-text')).toBeInTheDocument()
    expect(screen.getByTestId('key-size-info-icon')).toBeInTheDocument()
  })

  it('should display correct tooltip content for too large size', async () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockReturnValue({
      type: 'string',
      size: -1,
      length: 1
    })

    render(<KeyDetailsHeaderSizeLength {...mockProps} />)

    const infoIcon = screen.getByTestId('key-size-info-icon')
    userEvent.hover(infoIcon)

    // Since tooltip rendering might be async, we use findByText instead of getByText
    expect(await screen.findByText('The key size is too large to run the MEMORY USAGE command, as it may lead to performance issues.')).toBeInTheDocument()

    // Optionally, you can also test that the tooltip disappears on mouse leave
    userEvent.unhover(infoIcon)
  })
})
