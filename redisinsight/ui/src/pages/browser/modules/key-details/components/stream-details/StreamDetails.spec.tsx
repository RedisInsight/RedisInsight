import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, StreamDetails } from './StreamDetails'

const mockedProps = mock<Props>()

describe('StreamDetails', () => {
  it('should render', () => {
    expect(render(<StreamDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
})
