import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import ImportFileModal from './ImportFileModal'

describe('ImportFileModal', () => {
  it('should render', () => {
    expect(render(<ImportFileModal onClose={jest.fn()} />)).toBeTruthy()
  })

  it('should render with error', () => {
    expect(
      render(<ImportFileModal onClose={jest.fn()} error="error" errorMessage="errorMessage" />)
    ).toBeTruthy()
  })

  it('should render with invalid message', () => {
    expect(
      render(
        <ImportFileModal onClose={jest.fn()} isInvalid invalidMessage="invalidMessage" />
      )
    ).toBeTruthy()
  })

  it('should render with submit results', () => {
    expect(
      render(
        <ImportFileModal
          onClose={jest.fn()}
          submitResults={<div>submitResults</div>}
        />
      )
    ).toBeTruthy()
  })

  it('should render with loading', () => {
    expect(render(<ImportFileModal onClose={jest.fn()} loading />)).toBeTruthy()
  })

  it('should render with data', () => {
    expect(
      render(
        <ImportFileModal
          onClose={jest.fn()}
          data={{ success: [], partial: [], failed: [] }}
        />
      )
    ).toBeTruthy()
  })

  it('should render with data and error', () => {
    expect(
      render(
        <ImportFileModal
          onClose={jest.fn()}
          data={{ success: [], partial: [], failed: [] }}
          error="error"
        />
      )
    ).toBeTruthy()
  })
})
