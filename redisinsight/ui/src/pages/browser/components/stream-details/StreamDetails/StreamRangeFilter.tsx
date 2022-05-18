import React, { useCallback, useEffect, useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchStreamEntries } from 'uiSrc/slices/browser/stream'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { getFormatTime, getTimestampFromId } from 'uiSrc/utils/streamUtils'
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
  const { minVal, setMinVal } = useContext(StreamMinRangeContext)
  const { maxVal, setMaxVal } = useContext(StreamMaxRangeContext)

  const minValRef = useRef<HTMLInputElement>(null)
  const maxValRef = useRef<HTMLInputElement>(null)
  const range = useRef<HTMLInputElement>(null)

  const prevMaxValue: Props = usePrevious({ max })

  const resetFilter = () => {
    setMinVal(firstEntryTimeStamp)
    setMaxVal(lastEntryTimeStamp)
  }

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
  }, [min])

  useEffect(() => {
    if (!maxVal) {
      setMaxVal(lastEntryTimeStamp)
    }
  }, [max])

  useEffect(() => {
    if (max && prevMaxValue && maxVal === getTimestampFromId(prevMaxValue.max)) {
      setMaxVal(getTimestampFromId(max))
    }
  }, [prevMaxValue])

  useEffect(() => {
    if (minVal && maxVal) {
      const lastEntryFilter = maxVal === lastEntryTimeStamp ? SCAN_STREAM_END_DEFAULT : maxVal.toString()
      const firstEntryFilter = minVal === firstEntryTimeStamp ? SCAN_STREAM_START_DEFAULT : minVal.toString()
      dispatch(fetchStreamEntries(
        key,
        SCAN_COUNT_DEFAULT,
        firstEntryFilter,
        lastEntryFilter,
        sortedColumnOrder,
        false
      ))
    }
  }, [minVal, maxVal])

  if (!minVal && !maxVal) {
    return (
      <div className={styles.rangeWrapper}>
        <div style={{ left: '30px', width: 'calc(100% - 56px)' }} className={styles.slider__track} />
      </div>
    )
  }

  if (firstEntryTimeStamp === lastEntryTimeStamp) {
    return (
      <div className={styles.rangeWrapper}>
        <div style={{ left: '30px', width: 'calc(100% - 56px)' }} className={styles.slider__range}>
          <div className={styles['slider__left-value']}>{getFormatTime(minVal?.toString())}</div>
          <div className={styles['slider__right-value']}>{getFormatTime(maxVal?.toString())}</div>
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
          value={minVal}
          ref={minValRef}
          onChange={(event) => {
            const value = Math.min(+event.target.value, maxVal ?? 0 - 1)
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
            const value = Math.max(+event.target.value, minVal ?? 0 + 1)
            setMaxVal(value)
            event.target.value = value.toString()
          }}
          className={`${styles.thumb} ${styles['thumb--zindex-4']}`}
        />
        <div className={styles.slider}>
          <div className={styles.slider__track} />
          <div ref={range} className={styles.slider__range}>
            <div className={styles['slider__left-value']}>{getFormatTime(minVal?.toString())}</div>
            <div className={styles['slider__right-value']}>{getFormatTime(maxVal?.toString())}</div>
          </div>
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
