import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import NameSpacesTable, { Props } from './NameSpacesTable'

const mockedProps = mock<Props>()

describe('TopNamespaceView', () => {
  it('should render', () => {
    expect(render(<NameSpacesTable {...instance(mockedProps)} />)).toBeTruthy()
  })
})
