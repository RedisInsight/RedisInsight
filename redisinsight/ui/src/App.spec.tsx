import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import App from './App'

/**
 * App tests
 *
 * @group unit
 */
describe('App', () => {
  it('should render', () => {
    expect(render(<App />)).toBeTruthy()
  })
})
