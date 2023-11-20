import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import { pubSubSelector } from 'uiSrc/slices/pubsub/pubsub'
import MessagesListWrapper from './MessagesListWrapper'

jest.mock('uiSrc/slices/pubsub/pubsub', () => ({
  ...jest.requireActual('uiSrc/slices/pubsub/pubsub'),
  pubSubSelector: jest.fn().mockReturnValue({
    isSubscribed: false,
    messages: []
  }),
}))

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
    (pubSubSelector as jest.Mock).mockReturnValue({
      isSubscribed: true
    })

    const { queryByTestId } = render(<MessagesListWrapper />)

    expect(queryByTestId('messages-list')).toBeInTheDocument()
    expect(queryByTestId('empty-messages-list')).not.toBeInTheDocument()
  })

  it('should render MessagesList if messages.length !== 0', () => {
    (pubSubSelector as jest.Mock).mockReturnValue({
      messages: [{ time: 123, channel: 'channel', message: 'msg' }]
    })

    const { queryByTestId } = render(<MessagesListWrapper />)

    expect(queryByTestId('messages-list')).toBeInTheDocument()
    expect(queryByTestId('empty-messages-list')).not.toBeInTheDocument()
  })
})
