import { EuiLink } from '@elastic/eui'
import React from 'react'
import { Pages } from 'uiSrc/constants'
import { getRouterLinkProps } from 'uiSrc/services'
import { render, fireEvent, screen } from 'uiSrc/utils/test-utils'

describe('getRouterLinkProps', () => {
  it('should call click callback', () => {
    const mockOnClick = jest.fn()

    render(
      <EuiLink
        {...getRouterLinkProps(Pages.browser, mockOnClick)}
        data-testid="link"
      >
        Text
      </EuiLink>,
    )
    fireEvent.click(screen.getByTestId('link'))

    expect(mockOnClick).toBeCalled()
  })
})
