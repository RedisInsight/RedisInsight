import React from 'react'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { CreateIndexStepWrapper } from './CreateIndexStepWrapper'

const renderComponent = () => render(<CreateIndexStepWrapper />)

describe('CreateIndexStepWrapper', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const { container } = renderComponent()

    expect(container).toBeTruthy()

    // Check if the tabs are rendered
    const buildNewIndexTabTrigger = screen.getByText('Build new index')
    const usePresetIndexTabTrigger = screen.getByText('Use preset index')

    expect(buildNewIndexTabTrigger).toBeInTheDocument()
    expect(usePresetIndexTabTrigger).toBeInTheDocument()

    // Check if the "Use preset index" tab content is selected by default
    const usePresetIIndexTabContent = screen.queryByTestId(
      'vector-inde-tabs--use-preset-index-content',
    )
    expect(usePresetIIndexTabContent).toBeInTheDocument()
  })

  it('should switch to "Use preset index" tab when clicked', () => {
    renderComponent()

    const buildNewIndexTabTrigger = screen.getByText('Use preset index')
    fireEvent.click(buildNewIndexTabTrigger)

    // Check if the "Use preset index" tab is rendered
    const buildNewIndexTabContent = screen.queryByTestId(
      'vector-inde-tabs--use-preset-index-content',
    )
    expect(buildNewIndexTabContent).toBeInTheDocument()
  })

  it("shouldn't switch to 'Build new index' tab when clicked, since it is disabled", () => {
    renderComponent()

    const buildNewIndexTabTriggerLabel = screen.getByText('Build new index')
    const buildNewIndexTabTriggerButton =
      buildNewIndexTabTriggerLabel.closest('[type="button"]')

    expect(buildNewIndexTabTriggerButton).toHaveAttribute('disabled')
    expect(buildNewIndexTabTriggerButton).toHaveAttribute('data-disabled')

    // And when clicked, it should not change the active tab
    fireEvent.click(buildNewIndexTabTriggerLabel)

    // Check if the "Use preset index" tab is still active
    const usePresetIndexTabContent = screen.queryByTestId(
      'vector-inde-tabs--use-preset-index-content',
    )
    expect(usePresetIndexTabContent).toBeInTheDocument()
  })
})
