import React, { useCallback, useState, useEffect, useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchStreamEntries } from 'uiSrc/slices/browser/stream'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT, SCAN_STREAM_START_DEFAULT, SCAN_STREAM_END_DEFAULT } from 'uiSrc/constants/api'
import StreamRangeContext from 'uiSrc/contexts/streamRangeContext'

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
  );
  // const [range, setRange] = useContext(StreamRangeContext)
  const [minVal, setMinVal] = useState(firstEntryTimeStamp);
  const [maxVal, setMaxVal] = useState(lastEntryTimeStamp);
  const minValRef = useRef(null);
  const maxValRef = useRef(null);
  const range = useRef(null);

  const prevMaxValue = usePrevious({ max })

  const resetFilter = () => {
    setRange([firstEntryTimeStamp, lastEntryTimeStamp])
  }

  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value); // Preceding with '+' converts the value from type string to type number

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [minVal, getPercent]);

  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [maxVal, getPercent]);

  // useEffect(() => {
    // onChange({ min: minVal, max: maxVal });
  // }, [minVal, maxVal, onChange]);

  // useEffect(() => {
  //   if (range.length !== 2) {
  //     setRange([firstEntryTimeStamp, lastEntryTimeStamp])
  //   }
  // }, [max, min])

  // useEffect(() => {
  //   if (!!max && typeof prevMaxValue === 'string' && range[1] === parseInt(prevMaxValue.split('-')[0], 10)) {
  //     setRange(range[0], parseInt(max.split('-')[0], 10))
  //   }
  // }, [prevMaxValue])

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     const lastEntryFilter = range[1] === lastEntryTimeStamp ? SCAN_STREAM_END_DEFAULT : range[1].toString()
  //     const firstEntryFilter = range[0] === firstEntryTimeStamp ? SCAN_STREAM_START_DEFAULT : range[0].toString()
  //     setTicks([
  //       { label: getFormatTime(range[0]), value: range[0] },
  //       { label: getFormatTime(range[1]), value: range[1] }
  //     ])
  //     dispatch(fetchStreamEntries(key, SCAN_COUNT_DEFAULT, firstEntryFilter, lastEntryFilter, sortedColumnOrder))
  //   }, 500)

  //   return () => clearTimeout(delayDebounceFn)
  // }, [range[0], range[1]])

  return (
    <div className={styles.rangeWrapper}>
      <input
        type="range"
        min={firstEntryTimeStamp}
        max={lastEntryTimeStamp}
        value={minVal}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, maxVal - 1);
          setMinVal(value);
          event.target.value = value.toString();
        }}
        className={`${styles.thumb} ${styles['thumb--zindex-3']}`}
        // className={classnames("thumb thumb--zindex-3", {
        //   "thumb--zindex-5": minVal > max - 100
        // })}
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
        <div className={styles["slider__left-value"]}>{minVal}</div>
        <div className={styles["slider__right-value"]}>{maxVal}</div>
      </div>
      {/* <EuiDualRange
        id="stream-range-filter"
        className={styles.filter}
        min={firstEntryTimeStamp}
        max={lastEntryTimeStamp}
        step={1}
        value={range}
        onChange={setRange}
        fullWidth
        ticks={ticks}
        showTicks
        aria-label="stream range filter"
      /> */}
      {(range[0] !== firstEntryTimeStamp || range[1] !== lastEntryTimeStamp) && (
        <button
          data-testid="range-filter-btn"
          className={styles.resetButton}
          type="button"
          onClick={resetFilter}
        >
          {buttonString}
        </button>
      )}
    </div>
  )
}

export default StreamRangeFilter
