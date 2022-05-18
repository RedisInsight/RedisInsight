import React, { useCallback, useEffect, useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchStreamEntries } from 'uiSrc/slices/browser/stream'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { getFormatTime, getTimestampFromId } from 'uiSrc/utils/streamUtils'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT, SCAN_STREAM_START_DEFAULT, SCAN_STREAM_END_DEFAULT } from 'uiSrc/constants/api'
import StreamRangeStartContext from 'uiSrc/contexts/streamRangeStartContext'
import StreamRangeEndContext from 'uiSrc/contexts/streamRangeEndContext'

import styles from './styles.module.scss'

const buttonString = 'Reset Filter'

interface Props {
  sortedColumnOrder: SortOrder
  max: string
  min: string
}

function usePrevious(value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const StreamRangeFilter = ({ sortedColumnOrder, max, min }: Props) => {
  const dispatch = useDispatch()

  const firstEntryTimeStamp: number = getTimestampFromId(min)
  const lastEntryTimeStamp: number = getTimestampFromId(max)

  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }

  const getPercent = useCallback(
    (value) => Math.round(((value - firstEntryTimeStamp) / (lastEntryTimeStamp - firstEntryTimeStamp)) * 100),
    [firstEntryTimeStamp, lastEntryTimeStamp]
  )
  const { startVal, setStartVal } = useContext(StreamRangeStartContext)
  const { endVal, setEndVal } = useContext(StreamRangeEndContext)

  const minValRef = useRef<HTMLInputElement>(null)
  const maxValRef = useRef<HTMLInputElement>(null)
  const range = useRef<HTMLInputElement>(null)

  const prevMaxValue = usePrevious({ max }) ?? { max: '' }

  const resetFilter = useCallback(
    () => {
      setStartVal(firstEntryTimeStamp)
      setEndVal(lastEntryTimeStamp)
    },
    [firstEntryTimeStamp, lastEntryTimeStamp]
  )

  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(startVal)
      const maxPercent = getPercent(+maxValRef.current.value)

      if (range.current) {
        range.current.style.left = `${minPercent}%`
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [startVal, getPercent])

  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value)
      const maxPercent = getPercent(endVal)

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [endVal, getPercent])

  useEffect(() => {
    if (!startVal) {
      setStartVal(firstEntryTimeStamp)
    }
  }, [min])

  useEffect(() => {
    if (!endVal) {
      setEndVal(lastEntryTimeStamp)
    }
  }, [max])

  useEffect(() => {
    if (max && prevMaxValue && endVal === getTimestampFromId(prevMaxValue.max)) {
      setEndVal(getTimestampFromId(max))
    }
  }, [prevMaxValue])

  useEffect(() => {
    if (startVal && endVal) {
      const lastEntryFilter = endVal === lastEntryTimeStamp ? SCAN_STREAM_END_DEFAULT : endVal.toString()
      const firstEntryFilter = startVal === firstEntryTimeStamp ? SCAN_STREAM_START_DEFAULT : startVal.toString()
      dispatch(fetchStreamEntries(
        key,
        SCAN_COUNT_DEFAULT,
        firstEntryFilter,
        lastEntryFilter,
        sortedColumnOrder,
        false
      ))
    }
  }, [startVal, endVal])

  if (!startVal && !endVal) {
    return (
      <div className={styles.rangeWrapper}>
        <div style={{ left: '30px', width: 'calc(100% - 56px)' }} className={styles.sliderTrack} />
      </div>
    )
  }

  if (firstEntryTimeStamp === lastEntryTimeStamp) {
    return (
      <div className={styles.rangeWrapper}>
        <div style={{ left: '30px', width: 'calc(100% - 56px)' }} className={styles.sliderRange}>
          <div className={styles.sliderLeftValue}>{getFormatTime(startVal?.toString())}</div>
          <div className={styles.sliderRightValue}>{getFormatTime(endVal?.toString())}</div>
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
          value={startVal}
          ref={minValRef}
          onChange={(event) => {
            const value = Math.min(+event.target.value, endVal! - 1)
            setStartVal(value)
            event.target.value = value.toString()
          }}
          className={`${styles.thumb} ${styles.thumbZindex3}`}
        />
        <input
          type="range"
          min={firstEntryTimeStamp}
          max={lastEntryTimeStamp}
          value={endVal}
          ref={maxValRef}
          onChange={(event) => {
            const value = Math.max(+event.target.value, startVal! + 1)
            setEndVal(value)
            event.target.value = value.toString()
          }}
          className={`${styles.thumb} ${styles.thumbZindex4}`}
        />
        <div className={styles.slider}>
          <div className={styles.sliderTrack} />
          <div ref={range} className={styles.sliderRange}>
            <div className={styles.sliderLeftValue}>{getFormatTime(startVal?.toString())}</div>
            <div className={styles.sliderRightValue}>{getFormatTime(endVal?.toString())}</div>
          </div>
        </div>
      </div>
      {(startVal !== firstEntryTimeStamp || endVal !== lastEntryTimeStamp) && (
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
