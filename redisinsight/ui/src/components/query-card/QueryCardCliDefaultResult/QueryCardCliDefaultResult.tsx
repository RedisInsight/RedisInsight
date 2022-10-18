import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'

import VirtualList from 'uiSrc/components/virtual-list'
import { getNodeText } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  items: (string | JSX.Element)[]
  isFullScreen?: boolean
}

export const MIN_ROW_HEIGHT = 18
export const MIN_ROWS_COUNT = 11
export const MAX_CARD_HEIGHT = 210
export const SYMBOL_WIDTH = 4.5

const QueryCardCliGroupResult = (props: Props) => {
  const { items = [], isFullScreen } = props

  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })

  const calculateHeight = useCallback((sum: number, item: string | JSX.Element) => {
    const itemLength = getNodeText(item)?.length || 0
    const symbolsPerLine = (windowDimensions.width - 400) / SYMBOL_WIDTH

    return sum + Math.ceil((itemLength / symbolsPerLine)) * MIN_ROW_HEIGHT
  }, [windowDimensions.width])

  const calculatedHeight = items.length > MIN_ROWS_COUNT && !isFullScreen
    ? MAX_CARD_HEIGHT
    : items.reduce(calculateHeight, 0)

  useEffect(() => {
    updateWindowDimensions()
    globalThis.addEventListener('resize', updateWindowDimensions)
    return () => {
      globalThis.removeEventListener('resize', updateWindowDimensions)
    }
  }, [])

  const updateWindowDimensions = () => {
    setWindowDimensions({ height: globalThis.innerHeight, width: globalThis.innerWidth })
  }

  return (
    <div
      className={cx(styles.container, 'query-card-output-response-success')}
      style={{
        minHeight: isFullScreen
          ? windowDimensions.height - 65
          : Math.min(calculatedHeight, MAX_CARD_HEIGHT)
      }}
      data-testid="query-cli-card-result"
    >
      <VirtualList items={items} />
    </div>
  )
}

export default QueryCardCliGroupResult
