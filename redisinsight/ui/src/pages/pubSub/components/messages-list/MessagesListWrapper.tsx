import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { connectedInstanceSelector, connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { pubSubSelector } from 'uiSrc/slices/pubsub/pubsub'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import { RedisVersions } from 'uiSrc/constants/redisVersions'
import EmptyMessagesList from './EmptyMessagesList'
import MessagesList from './MessagesList'

const MessagesListWrapper = () => {
  const { messages = [], isSubscribed } = useSelector(pubSubSelector)
  const { connectionType } = useSelector(connectedInstanceSelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)

  const [isSpublishNotSupported, setIsSpublishNotSupported] = useState<boolean>(true)

  useEffect(() => {
    setIsSpublishNotSupported(
      isVersionHigherOrEquals(
        version,
        RedisVersions.SPUBLISH_NOT_SUPPORTED.since
      )
    )
  }, [version])

  return (
    <>
      {(messages.length > 0 || isSubscribed) && <MessagesList items={messages} />}
      {messages.length === 0 && !isSubscribed && (
        <EmptyMessagesList isSpublishNotSupported={isSpublishNotSupported} connectionType={connectionType} />
      )}
    </>
  )
}

export default MessagesListWrapper
