import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import { connectedInstanceSelector, connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { pubSubSelector } from 'uiSrc/slices/pubsub/pubsub'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import EmptyMessagesList from './EmptyMessagesList'
import MessagesList from './MessagesList'

import styles from './MessagesList/styles.module.scss'

const MessagesListWrapper = () => {
  const { messages = [], isSubscribed } = useSelector(pubSubSelector)
  const { connectionType } = useSelector(connectedInstanceSelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)

  const [isSpublishNotSupported, setIsSpublishNotSupported] = useState<boolean>(true)

  useEffect(() => {
    setIsSpublishNotSupported(
      isVersionHigherOrEquals(
        version,
        CommandsVersions.SPUBLISH_NOT_SUPPORTED.since
      )
    )
  }, [version])

  return (
    <>
      {(messages.length > 0 || isSubscribed) && (
        <div className={styles.wrapperContainer}>
          <div className={styles.header} data-testid="messages-list">
            <div className={styles.time}>Timestamp</div>
            <div className={styles.channel}>Channel</div>
            <div className={styles.message}>Message</div>
          </div>
          <div className={styles.listContainer}>
            <AutoSizer>
              {({ width, height }) => (
                <MessagesList
                  items={messages}
                  width={width}
                  height={height}
                />
              )}
            </AutoSizer>
          </div>
        </div>
      )}
      {messages.length === 0 && !isSubscribed && (
        <EmptyMessagesList isSpublishNotSupported={isSpublishNotSupported} connectionType={connectionType} />
      )}
    </>
  )
}

export default MessagesListWrapper
