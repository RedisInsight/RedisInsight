import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import AiAnswerMessage, { AiAnswerMessageProps } from './AiAnswerMessage'

const mockedProps = mock<AiAnswerMessageProps>()

describe('AiAnswerMessage', () => {
  it('should render', () => {
    expect(render(<AiAnswerMessage {...mockedProps} message={{ id: '1', content: 'test', type: '' }} />)).toBeTruthy()
  })
})
