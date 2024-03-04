import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { aiChatSelector, setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import ChatsWrapper from './ChatsWrapper'

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiChatSelector: jest.fn().mockReturnValue({
    activeTab: ''
  })
}))

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ChatsWrapper', () => {
  it('should render', () => {
    expect(render(<ChatsWrapper />)).toBeTruthy()
  })

  it('should call proper dispatch after click on tab', () => {
    render(<ChatsWrapper />)

    fireEvent.click(screen.getByTestId('ai-general-chat_tab'))

    expect(store.getActions()).toEqual([setSelectedTab(AiChatType.Assistance)])
  })

  it('should call proper dispatch after click on tab', () => {
    render(<ChatsWrapper />)

    fireEvent.click(screen.getByTestId('ai-database-chat_tab'))

    expect(store.getActions()).toEqual([setSelectedTab(AiChatType.Query)])
  })

  it('should render general chat when tab is selected', () => {
    (aiChatSelector as jest.Mock).mockReturnValue({ activeTab: AiChatType.Assistance })
    render(<ChatsWrapper />)

    fireEvent.click(screen.getByTestId('ai-database-chat_tab'))

    expect(screen.getByTestId('ai-general-chat')).toBeInTheDocument()
  })

  it('should render document chat when tab is selected', () => {
    (aiChatSelector as jest.Mock).mockReturnValue({ activeTab: AiChatType.Query })
    render(<ChatsWrapper />)

    fireEvent.click(screen.getByTestId('ai-database-chat_tab'))

    expect(screen.getByTestId('ai-document-chat')).toBeInTheDocument()
  })
})
