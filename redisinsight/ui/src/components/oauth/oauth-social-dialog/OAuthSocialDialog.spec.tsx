import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import OAuthSocialDialog, { Props } from './OAuthSocialDialog'

const mockedProps = mock<Props>()

describe('OAuthSocialDialog', () => {
  it('should render', () => {
    expect(render(<OAuthSocialDialog {...mockedProps} />)).toBeTruthy()
  })
})
