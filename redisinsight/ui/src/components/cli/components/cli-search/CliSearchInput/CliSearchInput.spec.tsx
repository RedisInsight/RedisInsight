import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import CliSearchInput from './CliSearchInput'

describe('CliSearchInput', () => {
  it('should render', () => {
    expect(render(<CliSearchInput submitSearch={jest.fn()} />)).toBeTruthy()
  })

  it('should call submitSearch with after typing', () => {
    const submitSearch = jest.fn()
    render(<CliSearchInput submitSearch={submitSearch} />)
    fireEvent.change(
      screen.getByTestId('cli-helper-search'),
      { target: { value: 'set' } }
    )
    expect(submitSearch).toBeCalledWith('set')
  })
})
