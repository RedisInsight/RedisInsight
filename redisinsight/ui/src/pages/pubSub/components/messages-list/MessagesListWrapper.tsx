import React from 'react'
import { useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { pubSubSelector } from 'uiSrc/slices/pubsub/pubsub'
import EmptyMessagesList from './EmptyMessagesList'
import MessagesList from './MessagesList'

import styles from './MessagesList/styles.module.scss'

const MessagesListWrapper = () => {
  const { messages = [], isSubscribed } = useSelector(pubSubSelector)
  const { connectionType } = useSelector(connectedInstanceSelector)

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
      {messages.length === 0 && !isSubscribed && <EmptyMessagesList connectionType={connectionType} />}
    </>
  )
}

export default MessagesListWrapper
