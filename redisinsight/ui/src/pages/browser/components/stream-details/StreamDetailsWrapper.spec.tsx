import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import StreamDetailsWrapper, { Props } from './StreamDetailsWrapper'

const mockedProps = mock<Props>()

describe('StreamDetailsWrapper', () => {
  it('should render', () => {
    expect(render(<StreamDetailsWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })
})
