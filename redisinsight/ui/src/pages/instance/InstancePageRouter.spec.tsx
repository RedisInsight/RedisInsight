import React from 'react'
import { screen } from '@testing-library/react'
import { render } from 'uiSrc/utils/test-utils'
import { MemoryRouter } from 'react-router-dom'
import InstancePageRouter from './InstancePageRouter'
import { PageNames, Pages } from 'uiSrc/constants'

const MockComponent = () => <div data-testid="mock-component">Test</div>

const mockedRoutes = [
  {
    path: '/redis-enterprise-autodiscovery',
  },
]

const mockComponentRoutes = [
  {
    pageName: PageNames.browser,
    path: Pages.browser(':instanceId'),
    component: MockComponent,
  },
]

describe('InstancePageRouter', () => {
  it('should render', () => {
    expect(
      render(<InstancePageRouter routes={mockedRoutes} />, { withRouter: true })
    ).toBeTruthy()
  })

  it('should not render 404 when route matches', () => {
    render(
      <MemoryRouter initialEntries={[Pages.browser('123')]}>
        <InstancePageRouter routes={mockComponentRoutes} />
      </MemoryRouter>
    )

    expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-component')).toBeInTheDocument()
  })

  it('should render 404 when unmatched route is used', () => {
    render(
      <MemoryRouter initialEntries={['/foo/bar']}>
        <InstancePageRouter routes={mockComponentRoutes} />
      </MemoryRouter>
    )

    expect(screen.queryByTestId('not-found-page')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument()
  })
})
