import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import InstanceConnections, { Props } from './InstanceConnections'

const mockedProps = mock<Props>()

describe('InstanceConnections', () => {
  it('should render', () => {
    expect(
      render(<InstanceConnections {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  it('should call changeConnectionType after change connection type', () => {
    const changeConnectionType = jest.fn()
    render(<InstanceConnections {...instance(mockedProps)} changeConnectionType={changeConnectionType} />)
    fireEvent.click(screen.getByTestId('add-auto'))
    expect(changeConnectionType).toBeCalled()
  })
})
