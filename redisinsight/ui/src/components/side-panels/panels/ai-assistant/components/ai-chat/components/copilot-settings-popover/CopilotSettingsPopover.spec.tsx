import React from 'react'
import { cloneDeep } from 'lodash'
import { mock } from 'ts-mockito'
import {
  cleanup,
  fireEvent,
  mockedStore,
  mockedStoreFn,
  render,
  screen,
  waitForEuiPopoverVisible,
} from 'uiSrc/utils/test-utils'
import CopilotSettingsPopover, { Props } from './CopilotSettingsPopover'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiChatSelector: jest.fn().mockReturnValue({
    loading: false,
    messages: [],
    generalAgreement: null,
    databaseAgreement: null,
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStoreFn())
  store.clearActions()
})

const mockDatabaseId = 'mockDatabaseId'

const mockGeneralAgreement = {
  accountId: 'mockedAccountId',
  consent: true,
}

const mockDatabaseAgreement = {
  accountId: 'mockedAccountId',
  databaseId: mockDatabaseId,
  dataConsent: true,
}

describe('CopilotSettingsPopover', () => {
  it('should render', () => {
    expect(render(<CopilotSettingsPopover {...mockedProps} />)).toBeTruthy()
  })

  it('should open copilot settings popover if settingsOpenedByDefault is set to true', async () => {
    render(<CopilotSettingsPopover
      {...mockedProps}
      generalAgreement={null}
      databaseId={mockDatabaseId}
      settingsOpenedByDefault
    />)

    await waitForEuiPopoverVisible()
    expect(screen.getByTestId('check-ai-agreement')).toBeInTheDocument()
    expect(screen.getByTestId('check-ai-database-agreement')).toBeInTheDocument()
  })

  it('should open copilot settings popover on click if general agreement accepted', async () => {
    render(<CopilotSettingsPopover
      {...mockedProps}
      databaseAgreement={mockDatabaseAgreement}
      generalAgreement={mockGeneralAgreement}
      databaseId={mockDatabaseId}
    />)
    expect(screen.queryAllByTestId('check-ai-agreement')).toHaveLength(0)

    fireEvent.click(screen.getByTestId('show-agreements-btn'))
    await waitForEuiPopoverVisible()
    expect(screen.getByTestId('check-ai-agreement')).toBeInTheDocument()
    expect(screen.getByTestId('check-ai-database-agreement')).toBeInTheDocument()
  })

  it('should not show database agreement checkbox if databaseId is null', async () => {
    render(<CopilotSettingsPopover {...mockedProps} generalAgreement={mockGeneralAgreement} databaseId={null} />)
    expect(screen.queryAllByTestId('check-ai-agreement')).toHaveLength(0)

    fireEvent.click(screen.getByTestId('show-agreements-btn'))
    await waitForEuiPopoverVisible()
    expect(screen.getByTestId('check-ai-agreement')).toBeInTheDocument()
    expect(screen.queryAllByTestId('check-ai-database-agreement')).toHaveLength(0)
  })

  it('should show warning message if database agreement unchecked', async () => {
    render(<CopilotSettingsPopover
      {...mockedProps}
      generalAgreement={mockGeneralAgreement}
      databaseAgreement={mockDatabaseAgreement}
      databaseId={mockDatabaseId}
    />)
    expect(screen.queryAllByTestId('check-ai-agreement')).toHaveLength(0)

    fireEvent.click(screen.getByTestId('show-agreements-btn'))
    await waitForEuiPopoverVisible()
    expect(screen.getByTestId('check-ai-agreement')).toBeInTheDocument()
    expect(screen.getByTestId('check-ai-database-agreement')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('check-ai-database-agreement'))
    expect(screen.getByText('This will delete the current message history and initiate a new session.')).toBeInTheDocument()
  })
})
