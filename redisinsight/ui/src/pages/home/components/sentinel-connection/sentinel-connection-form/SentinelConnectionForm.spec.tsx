import React from 'react'
import { instance, mock } from 'ts-mockito'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import SentinelConnectionForm, { Props } from './SentinelConnectionForm'

const mockedProps = mock<Props>()

const mockValues = {
  host: 'host',
  port: '123'
}

describe('SentinelConnectionForm', () => {
  it('should render', () => {
    expect(
      render(<SentinelConnectionForm {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  it('should call submit form on press Enter', async () => {
    const mockSubmit = jest.fn()
    render(<SentinelConnectionForm {...instance(mockedProps)} onSubmit={mockSubmit} initialValues={mockValues} />)

    await act(() => {
      fireEvent.keyDown(screen.getByTestId('form'), { key: 'Enter', code: 13, charCode: 13 })
    })

    expect(mockSubmit).toBeCalled()
  })

  it('should render Footer', async () => {
    render(
      <div id="footerDatabaseForm">
        <SentinelConnectionForm {...instance(mockedProps)} />
      </div>
    )

    expect(screen.getByTestId('btn-submit')).toBeInTheDocument()
  })
})
