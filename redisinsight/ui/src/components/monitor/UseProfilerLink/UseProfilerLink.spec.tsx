import { cloneDeep, set } from 'lodash'
import React from 'react'
import { cleanup, initialStateDefault, mockedStore, mockStore, render, screen } from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import UseProfilerLink from './UseProfilerLink'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const props = {
  onClick: () => {},
}

describe('UseProfilerLink', () => {
  it('should render', () => {
    expect(render(<UseProfilerLink {...props} />)).toBeTruthy()
  })

  it('should show the link when envDependent.flag = true', () => {
    render(<UseProfilerLink {...props} />)

    expect(screen.getByText('tool to see all the requests processed by the server.', { exact: false })).toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true }
    )

    render(<UseProfilerLink {...props} />, {
      store: mockStore(initialStoreState)
    })
    expect(screen.queryByTestId('user-profiler-link')).toBeInTheDocument()
    expect(screen.queryByTestId('user-profiler-link-disabled')).not.toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false }
    )

    render(<UseProfilerLink {...props} />, {
      store: mockStore(initialStoreState)
    })
    expect(screen.queryByTestId('user-profiler-link')).not.toBeInTheDocument()
    expect(screen.queryByTestId('user-profiler-link-disabled')).toBeInTheDocument()
  })
})
