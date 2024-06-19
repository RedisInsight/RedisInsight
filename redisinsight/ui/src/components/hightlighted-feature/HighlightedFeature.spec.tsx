import { EuiToolTip } from '@elastic/eui'
import { fireEvent } from '@testing-library/react'
import React from 'react'
import { act, render, screen, waitForEuiToolTipVisible } from 'uiSrc/utils/test-utils'

import HighlightedFeature from './HighlightedFeature'

const Content = () => <div data-testid="some-feature" />
describe('HighlightedFeature', () => {
  it('should render', () => {
    expect(render(
      <HighlightedFeature>
        <Content />
      </HighlightedFeature>
    )).toBeTruthy()
  })

  it('should render content', () => {
    render(
      <HighlightedFeature>
        <Content />
      </HighlightedFeature>
    )

    expect(screen.getByTestId('some-feature')).toBeInTheDocument()
  })

  it('should render dot highlighting', () => {
    render(
      <HighlightedFeature type="plain" isHighlight>
        <Content />
      </HighlightedFeature>
    )

    expect(screen.getByTestId('some-feature')).toBeInTheDocument()
    expect(screen.getByTestId('dot-highlighting')).toBeInTheDocument()
  })

  it('should render badge highlighting', async () => {
    render(
      <HighlightedFeature
        type="tooltip-badge"
        content="content"
        title="title"
        isHighlight
      >
        <Content />
      </HighlightedFeature>
    )

    expect(screen.getByTestId('some-feature')).toBeInTheDocument()
    expect(screen.getByTestId('badge-highlighting')).toBeInTheDocument()

    await act(async () => {
      fireEvent.mouseOver(screen.getByTestId('tooltip-badge-highlighting-inner'))
    })

    await waitForEuiToolTipVisible()

    expect(screen.queryByTestId('tooltip-badge-highlighting')).toBeInTheDocument()
    expect(screen.queryByTestId('tooltip-badge-highlighting')).toHaveTextContent('title')
    expect(screen.queryByTestId('tooltip-badge-highlighting')).toHaveTextContent('content')
  })

  it('should not render highlighting', () => {
    render(
      <HighlightedFeature type="plain" isHighlight={false}>
        <Content />
      </HighlightedFeature>
    )

    expect(screen.getByTestId('some-feature')).toBeInTheDocument()
    expect(screen.queryByTestId('dot-highlighting')).not.toBeInTheDocument()
  })

  it('should render tooltip highlighting', async () => {
    render(
      <HighlightedFeature
        type="tooltip"
        content="content"
        title="title"
        isHighlight
      >
        <Content />
      </HighlightedFeature>
    )

    expect(screen.getByTestId('some-feature')).toBeInTheDocument()
    expect(screen.getByTestId('dot-highlighting')).toBeInTheDocument()

    await act(async () => {
      fireEvent.mouseOver(screen.getByTestId('tooltip-highlighting-inner'))
    })

    await waitForEuiToolTipVisible()

    expect(screen.queryByTestId('tooltip-highlighting')).toBeInTheDocument()
    expect(screen.queryByTestId('tooltip-highlighting')).toHaveTextContent('title')
    expect(screen.queryByTestId('tooltip-highlighting')).toHaveTextContent('content')
  })

  it('should call onClick', () => {
    const onClick = jest.fn()
    render(
      <HighlightedFeature type="plain" onClick={onClick} isHighlight dataTestPostfix="feature">
        <Content />
      </HighlightedFeature>
    )

    fireEvent.click(screen.getByTestId('feature-highlighted-feature'))

    expect(onClick).toBeCalled()
  })

  it('should not render second tooltip', async () => {
    render(
      <HighlightedFeature
        type="tooltip"
        content="content"
        title="title"
        isHighlight
        hideFirstChild
      >
        <EuiToolTip
          title="PrevTooltipTitle"
          data-testid="no-render-tooltip"
        >
          <Content />
        </EuiToolTip>
      </HighlightedFeature>
    )

    await act(async () => {
      fireEvent.mouseOver(screen.getByTestId('some-feature'))
    })

    await waitForEuiToolTipVisible()

    expect(screen.queryByTestId('tooltip-highlighting')).toBeInTheDocument()
    expect(screen.queryByTestId('no-render-tooltip')).not.toBeInTheDocument()
  })
})
