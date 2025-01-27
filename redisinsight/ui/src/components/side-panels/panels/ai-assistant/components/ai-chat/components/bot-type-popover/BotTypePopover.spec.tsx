import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { AiTool } from 'uiSrc/slices/interfaces/aiAssistant'
import BotTypePopover, { Props } from './BotTypePopover'

const mockedProps = mock<Props>()

const mockSetSelected = jest.fn()

describe('BotTypePopover', () => {
  it('should render', () => {
    expect(render(<BotTypePopover {...mockedProps} />)).toBeTruthy()
  })
  it('should render the component with the correct initial state', () => {
    render(<BotTypePopover {...mockedProps} selectedBotType={AiTool.Query} />)
    expect(screen.getByTestId('choose-bot-type-btn')).toHaveTextContent(AiTool.Query)
  })

  it('should toggle the popover when the button is clicked', () => {
    render(<BotTypePopover {...mockedProps} />)
    expect(screen.queryByTestId(`bot-type-list-item-${AiTool.General}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`bot-type-list-item-${AiTool.Query}`)).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('choose-bot-type-btn'))
    expect(screen.getByTestId(`bot-type-list-item-${AiTool.General}`)).toBeInTheDocument()
    expect(screen.getByTestId(`bot-type-list-item-${AiTool.Query}`)).toBeInTheDocument()
  })

  it('should call setSelected and closes the popover when a list item is clicked', () => {
    render(<BotTypePopover {...mockedProps} setSelected={mockSetSelected} />)
    fireEvent.click(screen.getByTestId('choose-bot-type-btn'))
    fireEvent.click(screen.getByTestId(`bot-type-list-item-${AiTool.Query}`))
    expect(mockSetSelected).toHaveBeenCalledWith(AiTool.Query)
  })
})
