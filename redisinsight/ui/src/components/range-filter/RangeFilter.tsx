import React, { useCallback, useState, useEffect, useRef } from 'react'
import cx from 'classnames'

import { getFormatTime, } from 'uiSrc/utils/streamUtils'

import styles from './styles.module.scss'

const buttonString = 'Reset Filter'

export interface Props {
  max: number
  min: number
  start: number
  end: number
  handleChangeStart: (value: number) => void
  handleChangeEnd: (value: number) => void
}

function usePrevious(value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const RangeFilter = (props: Props) => {
  const { max, min, start, end, handleChangeStart, handleChangeEnd } = props

  const [startVal, setStartVal] = useState(start)
  const [endVal, setEndVal] = useState(end)

  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  )

  const minValRef = useRef<HTMLInputElement>(null)
  const maxValRef = useRef<HTMLInputElement>(null)
  const range = useRef<HTMLInputElement>(null)

  const prevValue = usePrevious({ max }) ?? { max: 0 }

  const resetFilter = useCallback(
    () => {
      handleChangeStart(min)
      handleChangeEnd(max)
    },
    [min, max]
  )

  const onChangeStart = useCallback(
    ({ target: { value } }) => {
      setStartVal(value)
    },
    []
  )

  const onMouseUpStart = useCallback(
    ({ target: { value } }) => {
      handleChangeStart(value)
    },
    []
  )

  const onMouseUpEnd = useCallback(
    ({ target: { value } }) => {
      handleChangeEnd(value)
    },
    []
  )

  const onChangeEnd = useCallback(
    ({ target: { value } }) => {
      setEndVal(value)
    },
    []
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
    setStartVal(start)
  }, [start])

  useEffect(() => {
    setEndVal(end)
  }, [end])

  useEffect(() => {
    if (max && prevValue && prevValue.max !== max && end === prevValue.max) {
      handleChangeEnd(max)
    }
  }, [prevValue])

  if (start === 0 && end === 0) {
    return (
      <div data-testid="mock-blank-range" className={styles.rangeWrapper}>
        <div className={cx(styles.sliderTrack, styles.mockRange)} />
      </div>
    )
  }

  if (start === end) {
    return (
      <div data-testid="mock-fill-range" className={styles.rangeWrapper}>
        <div className={cx(styles.sliderRange, styles.mockRange)}>
          <div className={styles.sliderLeftValue}>{getFormatTime(start?.toString())}</div>
          <div className={styles.sliderRightValue}>{getFormatTime(end?.toString())}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.rangeWrapper}>
        <input
          type="range"
          min={min}
          max={max}
          value={startVal}
          ref={minValRef}
          onChange={onChangeStart}
          onMouseUp={onMouseUpStart}
          className={cx(styles.thumb, styles.thumbZindex3)}
          data-testid="range-start-input"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={endVal}
          ref={maxValRef}
          onChange={onChangeEnd}
          onMouseUp={onMouseUpEnd}
          className={cx(styles.thumb, styles.thumbZindex4)}
          data-testid="range-end-input"
        />
        <div className={styles.slider}>
          <div className={styles.sliderTrack} />
          <div ref={range} className={styles.sliderRange}>
            <div className={styles.sliderLeftValue}>{getFormatTime(start?.toString())}</div>
            <div className={styles.sliderRightValue}>{getFormatTime(end?.toString())}</div>
          </div>
        </div>
      </div>
      {(start !== min || end !== max) && (
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

export default RangeFilter
