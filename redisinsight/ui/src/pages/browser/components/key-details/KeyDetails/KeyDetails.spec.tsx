import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import KeyDetails, { Props } from './KeyDetails'

const mockedProps = mock<Props>()

describe('KeyDetails', () => {
  it('should render', () => {
    expect(render(<KeyDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
})
