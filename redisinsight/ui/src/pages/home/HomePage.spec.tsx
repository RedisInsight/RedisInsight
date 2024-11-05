import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import HomePage from './HomePage'

jest.mock('uiSrc/slices/panels/sidePanels', () => ({
  ...jest.requireActual('uiSrc/slices/panels/sidePanels'),
  sidePanelsSelector: jest.fn().mockReturnValue({
    openedPanel: 'insights'
  }),
}))

/**
 * HomePage tests
 *
 * @group component
 */
describe('HomePage', () => {
  it('should render', async () => {
    expect(await render(<HomePage />)).toBeTruthy()
  })

  it('should render insights trigger', async () => {
    await render(<HomePage />)

    expect(screen.getByTestId('insights-trigger')).toBeInTheDocument()
  })

  it('should render side panel', async () => {
    await render(<HomePage />)

    expect(screen.getByTestId('side-panels-insights')).toBeInTheDocument()
  })
})
