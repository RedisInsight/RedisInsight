import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import FormDialog from './FormDialog'

describe('FormDialog', () => {
  it('should render', () => {
    render(
      <FormDialog
        isOpen
        onClose={jest.fn()}
        header={(<div data-testid="header" />)}
        footer={(<div data-testid="footer" />)}
      >
        <div data-testid="body" />
      </FormDialog>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('body')).toBeInTheDocument()
  })
})
