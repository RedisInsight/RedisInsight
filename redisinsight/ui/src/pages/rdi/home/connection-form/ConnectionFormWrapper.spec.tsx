import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import ConnectionFormWrapper, { Props } from './ConnectionFormWrapper'

const mockedProps = mock<Props>()

describe('ConnectionFormWrapper', () => {
  it('should render', () => {
    expect(render(<ConnectionFormWrapper {...mockedProps} />)).toBeTruthy()
  })

  it('should not render form with isOpen = false', () => {
    render(<ConnectionFormWrapper {...mockedProps} isOpen={false} />)

    expect(screen.queryByTestId('connection-form')).not.toBeInTheDocument()
  })

  it('should render form with isOpen = true', () => {
    render(<ConnectionFormWrapper {...mockedProps} isOpen />)

    expect(screen.getByTestId('connection-form')).toBeInTheDocument()
  })
})
