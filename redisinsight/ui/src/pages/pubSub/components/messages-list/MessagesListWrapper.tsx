import React from 'react'
import { useSelector } from 'react-redux'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { pubSubSelector } from 'uiSrc/slices/pubsub/pubsub'
import EmptyMessagesList from './EmptyMessagesList'
import MessagesList from './MessagesList'

const MessagesListWrapper = () => {
  const { messages = [], isSubscribed } = useSelector(pubSubSelector)
  const { connectionType } = useSelector(connectedInstanceSelector)

  return (
    <>
      {(messages.length > 0 || isSubscribed) && <MessagesList items={messages} />}
      {messages.length === 0 && !isSubscribed && <EmptyMessagesList connectionType={connectionType} />}
    </>
  )
}

export default MessagesListWrapper
