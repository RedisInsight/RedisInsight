import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, StringDetails } from './StringDetails'

const mockedProps = mock<Props>()

describe('StringDetails', () => {
  it('should render', () => {
    expect(render(<StringDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
})
