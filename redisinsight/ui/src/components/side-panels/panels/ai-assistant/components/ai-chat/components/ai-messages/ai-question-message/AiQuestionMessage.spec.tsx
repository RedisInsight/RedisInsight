import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import AiQuestionMessage, { AiQuestionMessageProps } from './AiQuestionMessage'

const mockedProps = mock<AiQuestionMessageProps>()

describe('AiAnswerMessage', () => {
  it('should render', () => {
    expect(render(<AiQuestionMessage {...mockedProps} message={{ id: '1', content: 'test', type: '' }} />)).toBeTruthy()
  })
})
