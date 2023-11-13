import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, DynamicTypeDetails } from './DynamicTypeDetails'

const mockedProps = mock<Props>()

describe('DynamicTypeDetails', () => {
  it('should render', () => {
    expect(render(<DynamicTypeDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
})
