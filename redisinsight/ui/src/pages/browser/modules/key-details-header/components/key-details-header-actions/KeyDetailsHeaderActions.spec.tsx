import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, KeyDetailsHeaderActions } from './KeyDetailsHeaderActions'

const mockedProps = mock<Props>()

describe('KeyDetailsHeaderActions', () => {
  it('should render', () => {
    expect(render(<KeyDetailsHeaderActions {...instance(mockedProps)} />)).toBeTruthy()
  })
})
