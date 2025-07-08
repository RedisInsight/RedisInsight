import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { CreateIndexStepWrapper } from './CreateIndexStepWrapper'

const initSUT = () => render(<CreateIndexStepWrapper />)

describe('CreateIndexStepWrapper', () => {
  it('should render', () => {
    const { container } = initSUT()

    expect(container).toBeTruthy()

    // Check if the tabs are rendered
    const buildNewIndexTabTrigger = screen.getByText('Build new index')
    const usePresetIndexTabTrigger = screen.getByText('Use preset index')

    expect(buildNewIndexTabTrigger).toBeInTheDocument()
    expect(usePresetIndexTabTrigger).toBeInTheDocument()

    // Check if the "Use preset index" tab content is selected by default
    const usePresetIIndexTabContent = screen.queryByText(
      'TODO: Add content later',
    )
    expect(usePresetIIndexTabContent).toBeInTheDocument()
  })

  it('should switch to "Use preset index" tab when clicked', () => {
    initSUT()

    const buildNewIndexTabTrigger = screen.getByText('Use preset index')
    fireEvent.click(buildNewIndexTabTrigger)

    // Check if the "Use preset index" tab is rendered
    const buildNewIndexTabContent = screen.queryByText(
      'TODO: Add content later',
    )
    expect(buildNewIndexTabContent).toBeInTheDocument()
  })

  it('shouldn\'t switch to "Build new index" tab when clicked, since it is disabled', () => {
    initSUT()

    const buildNewIndexTabTriggerLabel = screen.getByText('Build new index')
    const buildNewIndexTabTriggerButton =
      buildNewIndexTabTriggerLabel.closest('[type="button"]')

    expect(buildNewIndexTabTriggerButton).toHaveAttribute('disabled')
    expect(buildNewIndexTabTriggerButton).toHaveAttribute('data-disabled')

    // And when clicked, it should not change the active tab
    fireEvent.click(buildNewIndexTabTriggerLabel)

    // Check if the "Use preset index" tab is still active
    const usePresetIndexTabContent = screen.queryByText(
      'TODO: Add content later',
    )
    expect(usePresetIndexTabContent).toBeInTheDocument()
  })
})
