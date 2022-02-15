import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import HomePage from './HomePage'

jest.mock('uiSrc/slices/content/content-create-database', () => ({
  contentSelector: () => jest.fn().mockReturnValue({ data: {}, loading: false }),
}))

describe('HomePage', () => {
  it('should render', () => {
    expect(render(<HomePage />)).toBeTruthy()
  })
})
