import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import { RedisLogo } from './RedisLogo'

beforeEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('RedisLogo', () => {
  it('should have link if envDependant feature is on', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true }
    )
    render(
      <RedisLogo isRdiWorkspace={false} />,
      {
        store: mockStore(initialStoreState)
      }
    )

    expect(screen.getByTestId('redis-logo-link')).toBeInTheDocument()
  })

  it('should not have link if envDependant feature is off', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false }
    )
    render(
      <RedisLogo isRdiWorkspace={false} />,
      {
        store: mockStore(initialStoreState)
      }
    )

    expect(screen.queryByTestId('redis-logo-link')).not.toBeInTheDocument()
  })
})
