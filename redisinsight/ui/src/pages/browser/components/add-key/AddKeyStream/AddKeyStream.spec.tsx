import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { instance, mock } from 'ts-mockito'
import AddKeyStream, { Props } from './AddKeyStream'

const mockedProps = mock<Props>()

/**
 * AddKeyStream tests
 *
 * @group unit
 */
describe('AddKeyStream', () => {
  it('should render', () => {
    expect(render(<AddKeyStream {...instance(mockedProps)} />)).toBeTruthy()
  })
})
