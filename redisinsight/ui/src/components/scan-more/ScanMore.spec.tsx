import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, screen, render } from 'uiSrc/utils/test-utils'
import ScanMore, { Props } from './ScanMore'

const mockedProps = mock<Props>()

describe('ActionBar', () => {
  it('should render', () => {
    expect(render(<ScanMore {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call "onCloseActionBar"', () => {
    const handleClick = jest.fn()

    const renderer = render(
      <ScanMore {...instance(mockedProps)} onCloseActionBar={handleClick} />
    )

    expect(renderer).toBeTruthy()

    fireEvent.click(screen.getByTestId('cancel-selecting'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
