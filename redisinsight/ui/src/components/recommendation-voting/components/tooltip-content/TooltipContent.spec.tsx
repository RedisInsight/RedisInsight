import React from 'react'
import { instance, mock } from 'ts-mockito'
import { Vote } from 'uiSrc/constants/recommendations'

import { render, screen } from 'uiSrc/utils/test-utils'

import TooltipContent, { Props } from './TooltipContent'

const mockedProps = mock<Props>()

describe('RecommendationVoting', () => {
  it('should render', () => {
    expect(render(<TooltipContent {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render proper text for Like vote', () => {
    render(<TooltipContent {...instance(mockedProps)} vote={Vote.Like} />)
    expect(screen.getByTestId('common-text')).toHaveTextContent('Thank you for the feedback.')
    expect(screen.getByTestId('custom-text')).toHaveTextContent('Share your ideas with us.')
  })

  it('should render proper text for Dislike vote', () => {
    render(<TooltipContent {...instance(mockedProps)} vote={Vote.Dislike} />)
    expect(screen.getByTestId('common-text')).toHaveTextContent('Thank you for the feedback.')
    expect(screen.getByTestId('custom-text')).toHaveTextContent('Tell us how we can improve.')
  })
})
