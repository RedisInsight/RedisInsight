import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChangeEditorTypeButton, { ButtonMode } from './ChangeEditorTypeButton'

const mockSwitchEditorType = jest.fn()
jest.mock('./useChangeEditorType', () => ({
  useChangeEditorType: () => ({
    switchEditorType: mockSwitchEditorType,
  }),
}))

describe('ChangeEditorTypeButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render an enabled button with default tooltip', async () => {
    render(<ChangeEditorTypeButton />)

    const button = screen.getByRole('button', { name: /change editor type/i })
    expect(button).toBeEnabled()

    await userEvent.hover(button)

    expect(
      await screen.findByText('Edit value in text editor'),
    ).toBeInTheDocument()
  })

  it('should render a disabled button with read-only tooltip', async () => {
    render(<ChangeEditorTypeButton mode={ButtonMode.readOnly} />)

    const button = screen.getByRole('button', { name: /change editor type/i })
    expect(button).toBeDisabled()

    await userEvent.hover(button)

    expect(
      await screen.findByText('This JSON is too large to edit'),
    ).toBeInTheDocument()
  })

  it('should call switchEditorType on click when not disabled', async () => {
    render(<ChangeEditorTypeButton />)

    const button = screen.getByRole('button', { name: /change editor type/i })
    await userEvent.click(button)

    expect(mockSwitchEditorType).toHaveBeenCalled()
  })

  it('should not call switchEditorType when disabled', async () => {
    render(<ChangeEditorTypeButton mode={ButtonMode.readOnly} />)

    const button = screen.getByRole('button', { name: /change editor type/i })
    await userEvent.click(button)

    expect(mockSwitchEditorType).not.toHaveBeenCalled()
  })
})
