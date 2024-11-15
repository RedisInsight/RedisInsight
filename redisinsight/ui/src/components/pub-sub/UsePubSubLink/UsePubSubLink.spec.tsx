import { cloneDeep, set } from 'lodash'
import React from 'react'
import { cleanup, initialStateDefault, mockedStore, mockStore, render, screen } from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import UsePubSubLink from './UsePubSubLink'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const props = {
  path: '/pub-sub',
}

describe('UsePubSubLink', () => {
  it('should render', () => {
    expect(render(<UsePubSubLink {...props} />)).toBeTruthy()
  })

  it('should show the link when envDependent.flag = true', () => {
    render(<UsePubSubLink {...props} />)

    expect(screen.getByTestId('user-pub-sub-link')).toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true }
    )

    render(<UsePubSubLink {...props} />, {
      store: mockStore(initialStoreState)
    })
    expect(screen.queryByTestId('user-pub-sub-link')).toBeInTheDocument()
    expect(screen.queryByTestId('user-pub-sub-link-disabled')).not.toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false }
    )

    render(<UsePubSubLink {...props} />, {
      store: mockStore(initialStoreState)
    })
    expect(screen.queryByTestId('user-pub-sub-link')).not.toBeInTheDocument()
    expect(screen.queryByTestId('user-pub-sub-link-disabled')).toBeInTheDocument()
  })
})
