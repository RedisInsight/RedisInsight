import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { cleanup, act, fireEvent, render, screen, mockedStore, waitForEuiPopoverVisible } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { createAiAgreement } from 'uiSrc/slices/panels/aiAssistant'
import { BotType } from 'uiSrc/slices/interfaces/aiAssistant'
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

  describe('isAgreementAccepted', () => {
    it('should check general agreements when no dbId provided after click submit btn', () => {
      const isAgreementAccepted = jest.fn()
      render(<ChatForm {...mockedProps} isAgreementAccepted={isAgreementAccepted} dbId={null} />)

      expect(screen.getByTestId('ai-submit-message-btn')).toBeDisabled()

      act(() => {
        fireEvent.change(
          screen.getByTestId('ai-message-textarea'),
          { target: { value: 'test' } }
        )
      })

      fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

      expect(isAgreementAccepted).toBeCalledWith(null)
    })

    it('should check general agreements when click submit btn with value not starting with query', () => {
      const isAgreementAccepted = jest.fn()
      const dbId = 'mockAidbId'
      render(<ChatForm {...mockedProps} isAgreementAccepted={isAgreementAccepted} dbId={dbId} />)

      expect(screen.getByTestId('ai-submit-message-btn')).toBeDisabled()

      act(() => {
        fireEvent.change(
          screen.getByTestId('ai-message-textarea'),
          { target: { value: 'test' } }
        )
      })

      fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

      expect(isAgreementAccepted).toBeCalledWith(null)
    })

    it('should check general agreements when click submit btn with value not starting with query', () => {
      const isAgreementAccepted = jest.fn()
      const dbId = 'mockAidbId'
      render(<ChatForm {...mockedProps} isAgreementAccepted={isAgreementAccepted} dbId={dbId} />)

      expect(screen.getByTestId('ai-submit-message-btn')).toBeDisabled()

      act(() => {
        fireEvent.change(
          screen.getByTestId('ai-message-textarea'),
          { target: { value: '/query test' } }
        )
      })

      fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

      expect(isAgreementAccepted).toBeCalledWith(dbId)
    })
  })

  describe('onSubmit with existing agreements', () => {
    it('should be called if agreement accepted', () => {
      const isAgreementAccepted = jest.fn().mockReturnValue(true)
      const onSubmit = jest.fn()
      render(<ChatForm
        {...mockedProps}
        isAgreementAccepted={isAgreementAccepted}
        dbId={null}
        onSubmit={onSubmit}
      />)

      expect(screen.getByTestId('ai-submit-message-btn')).toBeDisabled()

      act(() => {
        fireEvent.change(
          screen.getByTestId('ai-message-textarea'),
          { target: { value: 'test' } }
        )
      })

      fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

      expect(isAgreementAccepted).toBeCalledWith(null)
      expect(onSubmit).toBeCalledWith('test')
    })

    it('should submit by enter', () => {
      const isAgreementAccepted = jest.fn().mockReturnValue(true)
      const onSubmit = jest.fn()
      render(<ChatForm
        {...mockedProps}
        isAgreementAccepted={isAgreementAccepted}
        dbId={null}
        onSubmit={onSubmit}
      />)

      act(() => {
        fireEvent.change(
          screen.getByTestId('ai-message-textarea'),
          { target: { value: 'test' } }
        )
      })

      fireEvent.keyDown(screen.getByTestId('ai-message-textarea'), {
        key: 'Enter',
      })

      expect(onSubmit).toBeCalledWith('test')
    })
  })

  describe('onSubmit when agreements not accepted yet', () => {
    it('should show agreement popover if agreement not accepted', () => {
      const isAgreementAccepted = jest.fn().mockReturnValue(false)
      const onSubmit = jest.fn()
      // const dbId = 'mockAidbId'
      render(<ChatForm
        {...mockedProps}
        isAgreementAccepted={isAgreementAccepted}
        dbId={null}
        onSubmit={onSubmit}
      />)

      expect(screen.getByTestId('ai-submit-message-btn')).toBeDisabled()

      act(() => {
        fireEvent.change(
          screen.getByTestId('ai-message-textarea'),
          { target: { value: 'test' } }
        )
      })

      fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

      expect(isAgreementAccepted).toBeCalledWith(null)
      expect(screen.getByTestId('ai-accept-agreements')).toBeInTheDocument()
      expect(onSubmit).not.toBeCalled()
    })

    it('should call necessary actions after click accept agreement btn', async () => {
      const sendEventTelemetryMock = jest.fn();
      (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
      const isAgreementAccepted = jest.fn().mockReturnValue(false)
      const onSubmit = jest.fn()
      render(<ChatForm
        {...mockedProps}
        isAgreementAccepted={isAgreementAccepted}
        dbId={null}
        onSubmit={onSubmit}
      />)

      expect(screen.getByTestId('ai-submit-message-btn')).toBeDisabled()

      act(() => {
        fireEvent.change(
          screen.getByTestId('ai-message-textarea'),
          { target: { value: 'test' } }
        )
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('ai-submit-message-btn'))
      })
      await waitForEuiPopoverVisible()

      expect(onSubmit).not.toBeCalled()
      expect(screen.getByTestId('ai-submit-message-btn')).toBeInTheDocument()

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.AI_CHAT_BOT_TERMS_DISPLAYED,
        eventData: {
          databaseId: undefined,
          chat: BotType.General,
        }
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('ai-accept-agreements'))
      })

      expect(store.getActions()).toEqual([
        createAiAgreement()
      ])

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.AI_CHAT_BOT_TERMS_ACCEPTED,
        eventData: {
          databaseId: undefined,
          chat: BotType.General,
        }
      })
    })
  })
})
