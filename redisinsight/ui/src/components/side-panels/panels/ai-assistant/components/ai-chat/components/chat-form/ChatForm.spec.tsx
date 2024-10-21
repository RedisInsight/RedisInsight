import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, render, screen, mockedStore, waitFor } from 'uiSrc/utils/test-utils'
import ChatForm, { Props } from './ChatForm'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ChatForm', () => {
  it('should render', () => {
    expect(render(<ChatForm {...mockedProps} />)).toBeTruthy()
  })

  it('should have input disabled and show text on hover if isGeneralAgreementAccepted is set to false', async () => {
    render(<ChatForm {...mockedProps} isGeneralAgreementAccepted={false} />)

    expect(screen.getByTestId('ai-submit-message-btn')).toBeDisabled()

    fireEvent.mouseOver(screen.getByTestId('ai-submit-message-btn'))
    await waitFor(() => screen.getByText('Accept the Redis Copilot General terms'))
    expect(screen.getByText('Accept the Redis Copilot General terms')).toBeInTheDocument()
  })

  it('should enable submit message btn when textarea has value inserted and call onSubmit', async () => {
    const onSubmit = jest.fn()
    render(<ChatForm {...mockedProps} isGeneralAgreementAccepted onSubmit={onSubmit} />)

    expect(screen.getByTestId('ai-submit-message-btn')).toBeDisabled()

    fireEvent.change(
      screen.getByTestId('ai-message-textarea'),
      { target: { value: 'test' } }
    )
    expect(screen.getByTestId('ai-submit-message-btn')).toBeEnabled()

    fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

    expect(onSubmit).toBeCalledWith('test')
  })
})
