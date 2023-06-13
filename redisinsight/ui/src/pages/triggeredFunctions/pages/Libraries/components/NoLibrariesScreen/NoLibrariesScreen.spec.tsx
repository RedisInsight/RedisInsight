import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import NoLibrariesScreen from './NoLibrariesScreen'

describe('NoLibrariesScreen', () => {
  it('should render', () => {
    expect(render(<NoLibrariesScreen />)).toBeTruthy()
  })
})
