import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import StreamRangeFilter, { Props } from './StreamDetails'

const mockedProps = mock<Props>()

describe('StreamRangeFilter', () => {
  it('should render', () => {
    expect(render(<StreamRangeFilter {...instance(mockedProps)} />)).toBeTruthy()
  })
})
