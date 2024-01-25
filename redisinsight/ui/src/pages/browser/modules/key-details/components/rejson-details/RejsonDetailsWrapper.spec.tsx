import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { RejsonDetailsWrapper, Props } from './RejsonDetailsWrapper'

const mockedProps = mock<Props>()

describe('RejsonDetailsWrapper', () => {
  it('should render', () => {
    expect(render(<RejsonDetailsWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })
})
