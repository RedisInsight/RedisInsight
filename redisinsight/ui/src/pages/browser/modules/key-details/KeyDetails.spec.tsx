import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import KeyDetails, { Props as KeyDetailsProps } from './KeyDetails'

const mockedProps = mock<KeyDetailsProps>()

describe('KeyDetails', () => {
  it('should render', () => {
    expect(render(<KeyDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render nothing when there are no keys', () => {
    render(<KeyDetails {...instance(mockedProps)} totalKeys={0} keysLastRefreshTime={null} />)

    expect(screen.queryByTestId('explore-guides')).not.toBeInTheDocument()
    expect(screen.queryByTestId('select-key-message')).not.toBeInTheDocument()
  })

  it('should render explore-guides when there are no keys', () => {
    render(<KeyDetails {...instance(mockedProps)} totalKeys={0} keysLastRefreshTime={1} />)

    expect(screen.getByTestId('explore-guides')).toBeInTheDocument()
  })

  it('should render proper message when there are keys', () => {
    render(<KeyDetails {...instance(mockedProps)} totalKeys={10} keysLastRefreshTime={1} />)

    expect(screen.getByTestId('select-key-message')).toBeInTheDocument()
  })
})
