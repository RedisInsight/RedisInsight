import React, { useCallback, useState, useEffect, useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchStreamEntries } from 'uiSrc/slices/browser/stream'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT, SCAN_STREAM_START_DEFAULT, SCAN_STREAM_END_DEFAULT } from 'uiSrc/constants/api'
import StreamMinRangeContext from 'uiSrc/contexts/streamMinRangeContext'
import StreamMaxRangeContext from 'uiSrc/contexts/streamMaxRangeContext'

import styles from './styles.module.scss'

const buttonString = 'Reset Filter'

interface Props {
  sortedColumnOrder: SortOrder
  max: string
  min: string
}

function usePrevious(value: unknown) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const StreamRangeFilter = ({ sortedColumnOrder, max, min }: Props) => {
  const dispatch = useDispatch()

  const firstEntryTimeStamp: number = parseInt(min.split('-')[0], 10)
  const lastEntryTimeStamp: number = parseInt(max.split('-')[0], 10)

  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }

  const getPercent = useCallback(
    (value) => Math.round(((value - firstEntryTimeStamp) / (lastEntryTimeStamp - firstEntryTimeStamp)) * 100),
    [firstEntryTimeStamp, lastEntryTimeStamp]
  )
  const [minVal, setMinVal] = useContext(StreamMinRangeContext)
  const [maxVal, setMaxVal] = useContext(StreamMaxRangeContext)

  const minValRef = useRef(null)
  const maxValRef = useRef(null)
  const range = useRef(null)

  const prevMaxValue = usePrevious({ max })

  const resetFilter = () => {
    setMinVal(firstEntryTimeStamp)
    setMaxVal(lastEntryTimeStamp)
  }
  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal)
      const maxPercent = getPercent(+maxValRef.current.value)

      if (range.current) {
        range.current.style.left = `${minPercent}%`
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [minVal, getPercent])

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value)
      const maxPercent = getPercent(maxVal)

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [maxVal, getPercent])

  useEffect(() => {
    if (!minVal) {
      setMinVal(firstEntryTimeStamp)
    }
    if (!maxVal) {
      setMaxVal(lastEntryTimeStamp)
    }
  }, [max, min])

  useEffect(() => {
    if (!!max && typeof prevMaxValue === 'string' && maxVal === parseInt(prevMaxValue.split('-')[0], 10)) {
      setMaxVal(parseInt(max.split('-')[0], 10))
    }
  }, [prevMaxValue])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const lastEntryFilter = maxVal === lastEntryTimeStamp ? SCAN_STREAM_END_DEFAULT : maxVal.toString()
      const firstEntryFilter = minVal === firstEntryTimeStamp ? SCAN_STREAM_START_DEFAULT : minVal.toString()
      dispatch(fetchStreamEntries(key, SCAN_COUNT_DEFAULT, firstEntryFilter, lastEntryFilter, sortedColumnOrder))
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [minVal, maxVal])

  if (!minVal && !maxVal) {
    return (
      <div className={styles.rangeWrapper}>
        <div className={styles.line} />
      </div>
    )
  }

  if (firstEntryTimeStamp === lastEntryTimeStamp) {
    return (
      <div className={styles.rangeWrapper}>
        <div className={styles['slider__left-value']}>{getFormatTime(minVal)}</div>
        <div className={styles['slider__right-value']}>{getFormatTime(maxVal)}</div>
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
          value={minVal}
          ref={minValRef}
          onChange={(event) => {
            const value = Math.min(+event.target.value, maxVal - 1)
            setMinVal(value)
            event.target.value = value.toString()
          }}
          className={`${styles.thumb} ${styles['thumb--zindex-3']}`}
        />
        <input
          type="range"
          min={firstEntryTimeStamp}
          max={lastEntryTimeStamp}
          value={maxVal}
          ref={maxValRef}
          onChange={(event) => {
            const value = Math.max(+event.target.value, minVal + 1)
            setMaxVal(value)
            event.target.value = value.toString()
          }}
          className={`${styles.thumb} ${styles['thumb--zindex-4']}`}
        />
        <div className={styles.slider}>
          <div className={styles.slider__track} />
          <div ref={range} className={styles.slider__range} />
          <div className={styles['slider__left-value']}>{getFormatTime(minVal)}</div>
          <div className={styles['slider__right-value']}>{getFormatTime(maxVal)}</div>
        </div>
      </div>
      {(minVal !== firstEntryTimeStamp || maxVal !== lastEntryTimeStamp) && (
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
