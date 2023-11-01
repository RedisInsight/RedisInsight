import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import SentinelConnectionForm, { Props } from './SentinelConnectionForm'

const mockedProps = mock<Props>()

describe('SentinelConnectionForm', () => {
  it('should render', () => {
    expect(
      render(<SentinelConnectionForm {...instance(mockedProps)} />)
    ).toBeTruthy()
  })
})
