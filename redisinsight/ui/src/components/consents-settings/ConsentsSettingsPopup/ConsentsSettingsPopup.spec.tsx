import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import ConsentsSettingsPopup from './ConsentsSettingsPopup'

/**
 * ConsentsSettingsPopup tests
 *
 * @group unit
 */
describe('ConsentsSettingsPopup', () => {
  it('should render', () => {
    expect(render(<ConsentsSettingsPopup />)).toBeTruthy()
  })
})
