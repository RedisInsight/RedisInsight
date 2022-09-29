import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import RejsonDetailsWrapper from './RejsonDetailsWrapper'

/**
 * ReJSONDetailsWrapper tests
 *
 * @group unit
 */
describe('ReJSONDetailsWrapper', () => {
  it('should render', () => {
    expect(render(<RejsonDetailsWrapper />)).toBeTruthy()
  })
})
