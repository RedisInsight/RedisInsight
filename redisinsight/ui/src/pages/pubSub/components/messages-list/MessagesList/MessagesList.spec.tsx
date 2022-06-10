import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import MessagesList, { Props } from './MessagesList'

const mockedProps = mock<Props>()

describe('MessagesList', () => {
  it('should render', () => {
    expect(
      render(<MessagesList {...instance(mockedProps)} />)
    ).toBeTruthy()
  })
})
