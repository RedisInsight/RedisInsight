import React from 'react'
import { render, fireEvent } from 'uiSrc/utils/test-utils'
import PageBreadcrumbs, { Breadcrumb } from './PageBreadcrumbs'

const onClick = jest.fn()
const breadcrumbs: Breadcrumb[] = [
  {
    text: 'first',
    href: '/',
    'data-test-subject': 'first-link',
    onClick,
  },
  {
    text: 'second',
    href: '/',
    'data-test-subject': 'second-link',
  },
  {
    text: 'third',
  },
]

describe('PageBreadcrumbs', () => {
  it('should render', () => {
    expect(render(<PageBreadcrumbs breadcrumbs={breadcrumbs} />)).toBeTruthy()
  })

  it('should render properly', () => {
    const { container } = render(<PageBreadcrumbs breadcrumbs={breadcrumbs} />)
    expect(
      container.querySelector('[data-test-subject="first-link"]'),
    ).toBeInTheDocument()
  })

  it('should call onClick', () => {
    const { container } = render(<PageBreadcrumbs breadcrumbs={breadcrumbs} />)
    fireEvent.click(
      container.querySelector('[data-test-subject="first-link"]') as Element,
    )
    expect(onClick).toBeCalled()
  })
})
