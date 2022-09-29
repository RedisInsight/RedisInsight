import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import VirtualGrid from './VirtualGrid'
import { IProps } from './interfaces'

const mockedProps = mock<IProps>()

/**
 * VirtualGrid tests
 *
 * @group unit
 */
describe('VirtualGrid', () => {
  it('should render', () => {
    expect(
      render(<VirtualGrid {...instance(mockedProps)} />)
    ).toBeTruthy()
  })
})
