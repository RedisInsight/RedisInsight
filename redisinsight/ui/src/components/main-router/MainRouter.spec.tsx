import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import Router from 'uiSrc/Router'
import MainRouter from './MainRouter'

describe('MainRouter', () => {
  it('should render', () => {
    expect(render(<Router><MainRouter /></Router>)).toBeTruthy()
  })
})
