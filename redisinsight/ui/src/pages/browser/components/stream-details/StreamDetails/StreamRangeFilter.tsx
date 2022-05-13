import React, { useState, useEffect, useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiDualRange } from '@elastic/eui'
import { EuiRangeTick } from '@elastic/eui/src/components/form/range/range_ticks'

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

function usePrevious(value) {
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

  const [ticks, setTicks] = useState<EuiRangeTick[]>([])

  const [range, setRange] = useContext(StreamRangeContext)

  const prevMaxValue = usePrevious({ max })

  const resetFilter = () => {
    setRange([firstEntryTimeStamp, lastEntryTimeStamp])
  }

  useEffect(() => {
    if (range.length !== 2) {
      setRange([firstEntryTimeStamp, lastEntryTimeStamp])
    }
  }, [max, min])

  useEffect(() => {
    if (!!max && typeof prevMaxValue === 'string' && range[1] === parseInt(prevMaxValue.split('-')[0], 10)) {
      setRange(range[0], parseInt(max.split('-')[0], 10))
    }
  }, [prevMaxValue])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const lastEntryFilter = range[1] === lastEntryTimeStamp ? SCAN_STREAM_END_DEFAULT : range[1].toString()
      const firstEntryFilter = range[0] === firstEntryTimeStamp ? SCAN_STREAM_START_DEFAULT : range[0].toString()
      setTicks([
        { label: getFormatTime(range[0]), value: range[0] },
        { label: getFormatTime(range[1]), value: range[1] }
      ])
      dispatch(fetchStreamEntries(key, SCAN_COUNT_DEFAULT, firstEntryFilter, lastEntryFilter, sortedColumnOrder))
    }, 500)



    return () => clearTimeout(delayDebounceFn)
  }, [range[0], range[1]])

  return (
    <div className={styles.rangeWrapper}>
      <EuiDualRange
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
      />
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
