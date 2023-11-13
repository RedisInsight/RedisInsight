import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, AddItemsPanel } from './AddItemsPanel'

const mockedProps = mock<Props>()

describe('AddItemsPanel', () => {
  it('should render', () => {
    expect(render(<AddItemsPanel {...instance(mockedProps)} />)).toBeTruthy()
  })
})
