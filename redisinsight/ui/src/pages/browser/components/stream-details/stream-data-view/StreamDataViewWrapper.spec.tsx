import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import StreamDataViewWrapper, { Props } from './StreamDataViewWrapper'

const mockedProps = mock<Props>()

describe('StreamDataViewWrapper', () => {
  it('should render', () => {
    expect(render(<StreamDataViewWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })
})
