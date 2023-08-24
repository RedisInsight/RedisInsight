import React from 'react'
import { useSelector } from 'react-redux'
import { RootState, store } from 'uiSrc/slices/store'
import { render } from 'uiSrc/utils/test-utils'

import MessagesListWrapper from './MessagesListWrapper'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

beforeEach(() => {
  const state: RootState = store.getState();

  (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
    ...state,
    pubsub: {
      ...state.pubsub,
    }
  }))
})

describe('MessagesListWrapper', () => {
  it('should render', () => {
    expect(
      render(<MessagesListWrapper />)
    ).toBeTruthy()
  })

  it('should render EmptyMessagesList by default', () => {
    const { queryByTestId } = render(<MessagesListWrapper />)

    expect(queryByTestId('messages-list')).not.toBeInTheDocument()
    expect(queryByTestId('empty-messages-list')).toBeInTheDocument()
  })

  it('should render MessagesList if isSubscribed === true', () => {
    const state: RootState = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
      ...state,
      pubsub: {
        ...state.pubsub,
        isSubscribed: true,
      }
    }))

    const { queryByTestId } = render(<MessagesListWrapper />)

    expect(queryByTestId('messages-list')).toBeInTheDocument()
    expect(queryByTestId('empty-messages-list')).not.toBeInTheDocument()
  })

  it('should render MessagesList if messages.length !== 0', () => {
    const state: RootState = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
      ...state,
      pubsub: {
        ...state.pubsub,
        messages: [{ time: 123, channel: 'channel', message: 'msg' }],
      }
    }))

    const { queryByTestId } = render(<MessagesListWrapper />)

    expect(queryByTestId('messages-list')).toBeInTheDocument()
    expect(queryByTestId('empty-messages-list')).not.toBeInTheDocument()
  })
})
