import React from 'react'
import { cloneDeep, set } from 'lodash'
import { initialStateDefault, mockStore, render, screen } from 'uiSrc/utils/test-utils'

import { FeatureFlags } from 'uiSrc/constants'
import BrowserSearchPanel, { Props } from './BrowserSearchPanel'

const mockedProps: Props = {
  handleBulkActionsPanel: jest.fn,
  handleAddKeyPanel: jest.fn,
  handleCreateIndexPanel: jest.fn
}
describe('BrowserSearchPanel', () => {
  it('should render', () => {
    expect(render(<BrowserSearchPanel {...mockedProps} />)).toBeTruthy()
  })

  it('should render search properly', () => {
    render(<BrowserSearchPanel {...mockedProps} />)
    const searchInput = screen.queryByTestId('search-key')
    expect(searchInput).toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true }
    )

    render(<BrowserSearchPanel {...mockedProps} />, {
      store: mockStore(initialStoreState)
    })
    expect(screen.queryByTestId('btn-bulk-actions')).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false }
    )

    render(<BrowserSearchPanel {...mockedProps} />, {
      store: mockStore(initialStoreState)
    })
    expect(screen.queryByTestId('btn-bulk-actions')).not.toBeInTheDocument()
  })
})
