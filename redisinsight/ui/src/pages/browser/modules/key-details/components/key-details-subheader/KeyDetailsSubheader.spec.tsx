import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { KeyDetailsSubheader, Props } from './KeyDetailsSubheader'

const mockedProps = mock<Props>()

describe('KeyDetailsSubheader', () => {
  it('should render', () => {
    expect(render(<KeyDetailsSubheader {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('calls onShowTtl when checkbox is clicked', () => {
    const { getByLabelText } = render(<KeyDetailsSubheader
      {...instance(mockedProps)}
      showTtl
      isExpireFieldsAvailable
    />)
    const el = screen.getByTestId('test-check-ttl') as HTMLInputElement
    expect(el.checked).toBe(true)
    expect(getByLabelText('Show TTL')).toBeInTheDocument()
  })
})
