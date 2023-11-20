import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import MessagesList, { Props } from './MessagesList'

const mockedProps = {
  ...mock<Props>(),
  height: 20,
  width: 20
}

describe('MessagesList', () => {
  it('should render', () => {
    expect(
      render(<MessagesList {...mockedProps} />)
    ).toBeTruthy()
  })
})
