import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import WelcomeComponent, { Props } from './WelcomeComponent'

jest.mock('uiSrc/slices/content/create-redis-buttons', () => ({
  contentSelector: () => jest.fn().mockReturnValue({ data: {}, loading: false }),
}))

const mockedProps = mock<Props>()

/**
 * WelcomeComponent tests
 *
 * @group unit
 */
describe('WelcomeComponent', () => {
  it('should render', () => {
    expect(
      render(<WelcomeComponent {...instance(mockedProps)} />)
    ).toBeTruthy()
  })
})
