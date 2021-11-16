import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import WelcomeComponent, { Props } from './WelcomeComponent'

const mockedProps = mock<Props>()

describe('WelcomeComponent', () => {
  it('should render', () => {
    expect(
      render(<WelcomeComponent {...instance(mockedProps)} />)
    ).toBeTruthy()
  })
})
