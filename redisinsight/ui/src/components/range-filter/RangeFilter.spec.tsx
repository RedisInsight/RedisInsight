import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import RangeFilter, { Props } from './RangeFilter'

const mockedProps = mock<Props>()

const startRangeTestId = 'range-start-input'
const endRangeTestId = 'range-end-input'
const resetBtnTestId = 'range-filter-btn'

describe('StreamRangeFilter', () => {
  it('should render', () => {
    expect(render(<RangeFilter {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call handleChangeStart onChange start range thumb', () => {
    const handleChangeStart = jest.fn()
    render(
      <RangeFilter
        {...instance(mockedProps)}
        handleChangeStart={handleChangeStart}
        start={1}
        end={1000}
      />
    )
    const startRangeInput = screen.getByTestId(startRangeTestId)

    fireEvent.change(
      startRangeInput,
      { target: { value: 123 } }
    )
    expect(handleChangeStart).toBeCalledTimes(1)
  })

  it('should call handleChangeEnd onChange end range thumb', () => {
    const handleChangeEnd = jest.fn()
    render(
      <RangeFilter
        {...instance(mockedProps)}
        handleChangeEnd={handleChangeEnd}
        start={1}
        end={100}
      />
    )
    const endRangeInput = screen.getByTestId(endRangeTestId)

    fireEvent.change(
      endRangeInput,
      { target: { value: 15 } }
    )
    expect(handleChangeEnd).toBeCalledTimes(1)
  })
  it('should reset start and end values on press Reset buttons', () => {
    const handleChangeEnd = jest.fn()
    const handleChangeStart = jest.fn()

    render(
      <RangeFilter
        {...instance(mockedProps)}
        handleChangeStart={handleChangeStart}
        handleChangeEnd={handleChangeEnd}
        start={1}
        end={100}
        min={1}
        max={120}
      />
    )
    const resetBtn = screen.getByTestId(resetBtnTestId)

    fireEvent.click(resetBtn)

    expect(handleChangeEnd).toBeCalledWith(120)
    expect(handleChangeStart).toBeCalledWith(1)
  })
})
