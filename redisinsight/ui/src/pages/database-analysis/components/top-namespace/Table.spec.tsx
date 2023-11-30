import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import Table, { Props } from './Table'

const mockedProps = mock<Props>()

describe('Table', () => {
  it('should render', () => {
    expect(render(<Table {...instance(mockedProps)} />)).toBeTruthy()
  })
})
