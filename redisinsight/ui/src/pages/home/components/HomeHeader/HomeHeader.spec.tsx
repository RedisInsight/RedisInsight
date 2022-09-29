import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import HomeHeader, { Props } from './HomeHeader'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/content/create-redis-buttons', () => {
  const defaultState = jest.requireActual('uiSrc/slices/content/create-redis-buttons').initialState
  return {
    contentSelector: () => jest.fn().mockReturnValue({
      ...defaultState,
      loading: false,
      data: { cloud: { title: 'Limited offer', description: 'Try Redis Cloud' } }
    }),
  }
})

/**
 * HomeHeader tests
 *
 * @group unit
 */
describe('HomeHeader', () => {
  it('should render', () => {
    expect(render(<HomeHeader {...instance(mockedProps)} />)).toBeTruthy()
  })
})
