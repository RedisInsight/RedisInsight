import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import Tab, { IProps } from './Tab'

const mockedProps = mock<IProps>()

describe('Tab', () => {
  it('should render', () => {
    expect(render(<Tab {...instance(mockedProps)} />)).toBeTruthy()
  })
})
