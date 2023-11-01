import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import RightPanel, { Props } from './RightPanel'

const mockedProps = mock<Props>()

describe('AddDatabasesContainer', () => {
  it('should render', () => {
    expect(
      render(<RightPanel {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  it('should render instance types after click on auto discover', () => {
    render(<RightPanel {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-auto'))
    expect(screen.getByTestId('db-types')).toBeInTheDocument()
  })
})
