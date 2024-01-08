import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import AddStreamEntries, { Props } from './AddStreamEntries'

const mockedProps = mock<Props>()

describe('AddStreamEntries', () => {
  it('should render', () => {
    expect(render(<AddStreamEntries {...mockedProps} />)).toBeTruthy()
  })
})
