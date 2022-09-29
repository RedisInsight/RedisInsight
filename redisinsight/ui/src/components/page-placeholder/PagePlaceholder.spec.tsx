import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import PagePlaceholder from './PagePlaceholder'

/**
 * PagePlaceholder tests
 *
 * @group unit
 */
describe('PagePlaceholder', () => {
  it('should render', () => {
    expect(render(<PagePlaceholder />)).toBeTruthy()
  })
})
