import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import KeyValueFormatter, { Props } from './KeyValueFormatter'

const mockedProps = {
  ...mock<Props>(),
}

describe('KeyValueFormatter', () => {
  it('should render', () => {
    expect(render(<KeyValueFormatter {...mockedProps} />)).toBeTruthy()
  })
})
