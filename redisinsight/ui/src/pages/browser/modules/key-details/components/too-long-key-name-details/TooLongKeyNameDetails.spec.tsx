import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import TooLongKeyNameDetails
  from 'uiSrc/pages/browser/modules/key-details/components/too-long-key-name-details/TooLongKeyNameDetails'

describe('TooLongKeyNameDetails', () => {
  it('should render', () => {
    expect(render(<TooLongKeyNameDetails />)).toBeTruthy()
  })
})
