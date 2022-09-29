import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import Divider, { Props } from './Divider'

const mockedProps = mock<Props>()

/**
 * Divider tests
 *
 * @group unit
 */
describe('Divider', () => {
  it('should render', () => {
    expect(render(<Divider {...instance(mockedProps)} />)).toBeTruthy()
  })
})
