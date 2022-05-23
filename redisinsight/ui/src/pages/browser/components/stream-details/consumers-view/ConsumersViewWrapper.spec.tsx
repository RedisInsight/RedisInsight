import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import ConsumersViewWrapper, { Props } from './ConsumersViewWrapper'

const mockedProps = mock<Props>()

describe('ConsumersViewWrapper', () => {
  it('should render', () => {
    expect(render(<ConsumersViewWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })
})
