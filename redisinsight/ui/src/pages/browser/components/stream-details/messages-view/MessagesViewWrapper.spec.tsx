import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import MessagesViewWrapper, { Props } from './MessagesViewWrapper'

const mockedProps = mock<Props>()

describe('MessagesViewWrapper', () => {
  it('should render', () => {
    expect(render(<MessagesViewWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })
})
