import React, { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import {
  fetchStreamEntries,
  streamRangeSelector,
  streamDataSelector,
  updateStart,
  updateEnd,
} from 'uiSrc/slices/browser/stream'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { getFormatTime, getTimestampFromId } from 'uiSrc/utils/streamUtils'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'

import styles from './styles.module.scss'

const buttonString = 'Reset Filter'

export interface Props {
  sortedColumnOrder: SortOrder
}

function usePrevious(value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const StreamRangeFilter = ({ sortedColumnOrder }: Props) => {
  const dispatch = useDispatch()

  const {
    start,
    end,
  } = useSelector(streamRangeSelector)

  const { firstEntry, lastEntry } = useSelector(streamDataSelector)

  const startNumber = start === '' ? 0 : parseInt(start, 10)
  const endNumber = end === '' ? 0 : parseInt(end, 10)

  const min = firstEntry?.id
  const max = lastEntry?.id

  const firstEntryTimeStamp: number = getTimestampFromId(min)
  const lastEntryTimeStamp: number = getTimestampFromId(max)

  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }

  const getPercent = useCallback(
    (value) => Math.round(((value - firstEntryTimeStamp) / (lastEntryTimeStamp - firstEntryTimeStamp)) * 100),
    [firstEntryTimeStamp, lastEntryTimeStamp]
  )

  const minValRef = useRef<HTMLInputElement>(null)
  const maxValRef = useRef<HTMLInputElement>(null)
  const range = useRef<HTMLInputElement>(null)

  const prevMaxValue = usePrevious({ max }) ?? { max: '' }

  const resetFilter = useCallback(
    () => {
      dispatch(updateStart(firstEntryTimeStamp.toString()))
      dispatch(updateEnd(lastEntryTimeStamp.toString()))
    },
    [firstEntryTimeStamp, lastEntryTimeStamp]
  )

  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(startNumber)
      const maxPercent = getPercent(+maxValRef.current.value)

      if (range.current) {
        range.current.style.left = `${minPercent}%`
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [startNumber, getPercent])

  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value)
      const maxPercent = getPercent(endNumber)

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [endNumber, getPercent])

  useEffect(() => {
    if (start === '') {
      dispatch(updateStart(firstEntryTimeStamp.toString()))
    }
  }, [min])

  useEffect(() => {
    if (end === '') {
      dispatch(updateEnd(lastEntryTimeStamp.toString()))
    }
  }, [max])

  useEffect(() => {
    if (max && prevMaxValue && prevMaxValue.max !== max && endNumber === getTimestampFromId(prevMaxValue.max)) {
      dispatch(updateEnd(getTimestampFromId(max).toString()))
    }
  }, [prevMaxValue])

  useEffect(() => {
    if (start !== '' && end !== '') {
      dispatch(fetchStreamEntries(
        key,
        SCAN_COUNT_DEFAULT,
        sortedColumnOrder,
        false
      ))
    }
  }, [start, end])

  if (start === '' && end === '') {
    return (
      <div className={styles.rangeWrapper}>
        <div className={cx(styles.sliderTrack, styles.mockRange)} />
      </div>
    )
  }

  if (start === end) {
    return (
      <div className={styles.rangeWrapper}>
        <div className={cx(styles.sliderRange, styles.mockRange)}>
          <div className={styles.sliderLeftValue}>{getFormatTime(start)}</div>
          <div className={styles.sliderRightValue}>{getFormatTime(end)}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.rangeWrapper}>
        <input
          type="range"
          min={firstEntryTimeStamp}
          max={lastEntryTimeStamp}
          value={startNumber}
          ref={minValRef}
          onChange={(event) => {
            const value = Math.min(+event.target.value, endNumber - 1)
            dispatch(updateStart(value.toString()))
            event.target.value = value.toString()
          }}
          className={cx(styles.thumb, styles.thumbZindex3)}
          data-testid="range-start-input"
        />
        <input
          type="range"
          min={firstEntryTimeStamp}
          max={lastEntryTimeStamp}
          value={endNumber}
          ref={maxValRef}
          onChange={(event) => {
            const value = Math.max(+event.target.value, startNumber + 1)
            dispatch(updateEnd(value.toString()))
            event.target.value = value.toString()
          }}
          className={cx(styles.thumb, styles.thumbZindex4)}
          data-testid="range-end-input"
        />
        <div className={styles.slider}>
          <div className={styles.sliderTrack} />
          <div ref={range} className={styles.sliderRange}>
            <div className={styles.sliderLeftValue}>{getFormatTime(start)}</div>
            <div className={styles.sliderRightValue}>{getFormatTime(end)}</div>
          </div>
        </div>
      </div>
      {(startNumber !== firstEntryTimeStamp || endNumber !== lastEntryTimeStamp) && (
        <button
          data-testid="range-filter-btn"
          className={styles.resetButton}
          type="button"
          onClick={resetFilter}
        >
          {buttonString}
        </button>
      )}
    </>
  )
}

export default StreamRangeFilter
