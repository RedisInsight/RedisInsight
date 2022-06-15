import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ListChildComponentProps, ListOnScrollProps, VariableSizeList as List } from 'react-window'
import { EuiButton, EuiIcon } from '@elastic/eui'

import { getFormatDateTime } from 'uiSrc/utils'
import { IMessage } from 'apiSrc/modules/pub-sub/interfaces/message.interface'

import styles from './styles.module.scss'

export interface Props {
  items: IMessage[]
  width: number
  height: number
}

const PROTRUDING_OFFSET = 2
const MIN_ROW_HEIGHT = 30

const MessagesList = (props: Props) => {
  const { items = [], width = 0, height = 0 } = props

  const [showAnchor, setShowAnchor] = useState<boolean>(false)
  const listRef = useRef<List>(null)
  const followRef = useRef<boolean>(true)
  const hasMountedRef = useRef<boolean>(false)
  const rowHeights = useRef<{ [key: number]: number }>({})
  const outerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [])

  useEffect(() => {
    if (items.length > 0 && followRef.current) {
      setTimeout(() => {
        scrollToBottom()
      }, 0)
    }
  }, [items])

  useEffect(() => {
    if (followRef.current) {
      setTimeout(() => {
        scrollToBottom()
      }, 0)
    }
  }, [width, height])

  const getRowHeight = (index: number) => (
    rowHeights.current[index] > MIN_ROW_HEIGHT ? (rowHeights.current[index] + 2) : MIN_ROW_HEIGHT
  )

  const setRowHeight = (index: number, size: number) => {
    listRef.current?.resetAfterIndex(0)
    rowHeights.current = { ...rowHeights.current, [index]: size }
  }

  const scrollToBottom = () => {
    listRef.current?.scrollToItem(items.length - 1, 'end')
    requestAnimationFrame(() => {
      listRef.current?.scrollToItem(items.length - 1, 'end')
    })
  }

  // TODO: delete after manual tests
  // const scrollToBottomReserve = () => {
  //   const { scrollHeight = 0, offsetHeight = 0 } = outerRef.current || {}

  //   listRef.current?.scrollTo(scrollHeight - offsetHeight)
  //   requestAnimationFrame(() => {
  //     listRef.current?.scrollTo(scrollHeight - offsetHeight)
  //   })
  // }

  const handleAnchorClick = () => {
    scrollToBottom()
  }

  const handleScroll = useCallback((e: ListOnScrollProps) => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    if (e.scrollUpdateWasRequested === false) {
      followRef.current = false
      setShowAnchor(true)
    }

    if (!outerRef.current) {
      return
    }

    if (e.scrollOffset + outerRef.current.offsetHeight === outerRef.current.scrollHeight) {
      followRef.current = true
      setShowAnchor(false)
    }
  }, [])

  const Row = ({ index, style }: ListChildComponentProps) => {
    const rowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current?.clientHeight)
      }
    }, [rowRef])

    const { channel, message, time } = items[index]

    return (
      <div style={style} className={styles.item} data-testid={`row-${index}`}>
        <div className={styles.time}>{getFormatDateTime(time)}</div>
        <div className={styles.channel}>{channel}</div>
        <div className={styles.message} ref={rowRef}>{message}</div>
      </div>
    )
  }

  return (
    <>
      <List
        height={height}
        itemCount={items.length}
        itemSize={getRowHeight}
        ref={listRef}
        width={width - PROTRUDING_OFFSET}
        className={styles.listContent}
        outerRef={outerRef}
        onScroll={handleScroll}
        overscanCount={30}
      >
        {Row}
      </List>
      {showAnchor && (
        <EuiButton
          fill
          color="secondary"
          className={styles.anchorBtn}
          onClick={handleAnchorClick}
          data-testid="messages-list-anchor-btn"
        >
          New messages
          <EuiIcon type="sortDown" />
        </EuiButton>
      )}
    </>
  )
}

export default MessagesList
