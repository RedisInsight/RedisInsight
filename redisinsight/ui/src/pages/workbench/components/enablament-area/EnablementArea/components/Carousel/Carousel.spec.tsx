import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import Carousel, { Props } from './Carousel'

const mockedProps = mock<Props>()

describe('Carousel', () => {
  it('should render initial slide and pagination by using React portal', () => {
    const { container, queryByTestId } = render(
      <div>
        <Carousel {...instance(mockedProps)}>
          <article key="slide-1" data-testid="slide-1">Slide 1</article>
          <article key="slide-2" data-testid="slide-2">Slide 2</article>
        </Carousel>
        <div id="internalPageFooter" />
      </div>
    )

    expect(container).toBeTruthy()
    expect(queryByTestId('slide-1')).toBeInTheDocument()
    expect(queryByTestId('slide-2')).not.toBeInTheDocument()
    expect(container?.querySelector('.pagination')).toBeInTheDocument()
  })
  it('should switch slide', () => {
    const { queryByTestId, container } = render(
      <div>
        <Carousel {...instance(mockedProps)}>
          <article key="slide-1" data-testid="slide-1">Slide 1</article>
          <article key="slide-2" data-testid="slide-2">Slide 2</article>
        </Carousel>
        <div id="internalPageFooter" />
      </div>
    )

    fireEvent.click(container?.querySelector('[data-test-subj="pagination-button-next"]') as Element)
    expect(queryByTestId('slide-1')).not.toBeInTheDocument()
    expect(queryByTestId('slide-2')).toBeInTheDocument()
  })
})
