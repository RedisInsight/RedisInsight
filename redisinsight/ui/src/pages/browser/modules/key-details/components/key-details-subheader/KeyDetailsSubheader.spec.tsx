import React from 'react'
import { render, fireEvent } from 'uiSrc/utils/test-utils'
import { KeyDetailsSubheader } from './KeyDetailsSubheader'

describe('KeyDetailsSubheader', () => {
  const props = {
    showTtl: false,
    onShowTtl: jest.fn(),
    onAddKey: jest.fn(),
    isExpireFieldsAvailable: true,
  }

  it('should render', () => {
    const { getByText, getByTestId } = render(<KeyDetailsSubheader {...props} />)
    expect(getByText('Show TTL')).toBeInTheDocument()
    expect(getByTestId('btn-add-key')).toBeInTheDocument()
  })

  it('calls onShowTtl when checkbox is clicked', () => {
    const { getByLabelText } = render(<KeyDetailsSubheader {...props} />)
    fireEvent.click(getByLabelText('Show TTL'))
    expect(props.onShowTtl).toHaveBeenCalledWith(true)
  })

  it('calls onAddKey when add key button is clicked', () => {
    const { getByTestId } = render(<KeyDetailsSubheader {...props} />)
    fireEvent.click(getByTestId('btn-add-key'))
    expect(props.onAddKey).toHaveBeenCalled()
  })
})
