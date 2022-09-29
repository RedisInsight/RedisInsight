import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import UnsupportedTypeDetails from './UnsupportedTypeDetails'

/**
 * UnsupportedTypeDetails tests
 *
 * @group unit
 */
describe('UnsupportedTypeDetails', () => {
  it('should render', () => {
    expect(render(<UnsupportedTypeDetails />)).toBeTruthy()
  })
})
