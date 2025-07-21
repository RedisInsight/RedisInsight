import React from 'react'
import { cleanup, render, screen, userEvent } from 'uiSrc/utils/test-utils'

import { HeaderActions } from './HeaderActions'

// Workaround for @redis-ui/components Title component issue with react-children-utilities
// TypeError: react_utils.childrenToString is not a function
jest.mock('uiSrc/components/base/layout/drawer', () => ({
  ...jest.requireActual('uiSrc/components/base/layout/drawer'),
  DrawerHeader: jest.fn().mockReturnValue(null),
}))

const renderComponent = () => render(<HeaderActions />)

describe('ManageIndexesDrawer', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const { container } = renderComponent()

    expect(container).toBeTruthy()

    const headerActions = screen.getByTestId('vector-search-header-actions')
    expect(headerActions).toBeInTheDocument()

    // Verify the presence of the actions
    const savedQueriesButton = screen.getByText('Saved queries')
    expect(savedQueriesButton).toBeInTheDocument()

    const manageIndexesButton = screen.getByText('Manage indexes')
    expect(manageIndexesButton).toBeInTheDocument()
  })

  it('should open a drawer when "Manage indexes" is clicked', async () => {
    renderComponent()

    const manageIndexesButton = screen.getByText('Manage indexes')
    expect(manageIndexesButton).toBeInTheDocument()

    // Simulate clicking the "Manage indexes" button
    await userEvent.click(manageIndexesButton)

    // Check if the drawer is opened
    const drawer = screen.getByTestId('manage-indexes-drawer')
    expect(drawer).toBeInTheDocument()

    // Simulate clicking outside the drawer to close it
    await userEvent.click(document.body, { pointerEventsCheck: 0 })
    expect(drawer).not.toBeInTheDocument()
  })
})
