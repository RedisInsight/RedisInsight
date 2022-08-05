import React from 'react'
import { mock } from 'ts-mockito'
import { KeyTypes } from 'uiSrc/constants'
import { render, screen } from 'uiSrc/utils/test-utils'

import KeyValueFormatter, { Props } from './KeyValueFormatter'

const mockedProps = {
  ...mock<Props>(),
}

describe('KeyValueFormatter', () => {
  it('should render', () => {
    expect(render(<KeyValueFormatter {...mockedProps} />)).toBeTruthy()
  })
})
