import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import RejsonDetailsWrapper from './RejsonDetailsWrapper'

describe('ReJSONDetailsWrapper', () => {
  it('should render', () => {
    expect(render(<RejsonDetailsWrapper />)).toBeTruthy()
  })
})
