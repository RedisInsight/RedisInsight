import React, { useCallback, useEffect, useRef } from 'react'
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

const RangeFilter = ({ max, min, start, end, handleChangeStart, handleChangeEnd }: Props) => {
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

  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(start)
      const maxPercent = getPercent(+maxValRef.current.value)

      if (range.current) {
        range.current.style.left = `${minPercent}%`
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [start, getPercent])

  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value)
      const maxPercent = getPercent(end)

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [end, getPercent])

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
          value={start}
          ref={minValRef}
          onChange={(event) => {
            const value = Math.min(+event.target.value, end - 1)
            handleChangeStart(value)
            event.target.value = value.toString()
          }}
          className={cx(styles.thumb, styles.thumbZindex3)}
          data-testid="range-start-input"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={end}
          ref={maxValRef}
          onChange={(event) => {
            const value = Math.max(+event.target.value, start + 1)
            handleChangeEnd(value)
            event.target.value = value.toString()
          }}
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
