import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import { ResizeObserver } from './ResizeObserver'

describe('ResizeObserver', () => {
  it('should render children correctly', () => {
    const { queryByTestId } = render(
      <ResizeObserver onResize={jest.fn()}>
        {(resizeRef) => (
          <div data-testid="children" ref={resizeRef}>
            Test Child
          </div>
        )}
      </ResizeObserver>,
    )

    expect(queryByTestId('children')).toBeInTheDocument()
  })

  // TODO [DA]: test onResize called when resized and not called when not resized
})
