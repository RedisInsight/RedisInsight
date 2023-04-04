import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { setRecommendationVote } from 'uiSrc/slices/analytics/dbAnalysis'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { Vote } from 'uiSrc/constants/recommendations'

import {
  act,
  cleanup,
  mockedStore,
  fireEvent,
  render,
  screen,
  waitForEuiPopoverVisible,
  waitForEuiToolTipVisible,
} from 'uiSrc/utils/test-utils'

import RecommendationVoting, { Props } from './RecommendationVoting'

const mockedProps = mock<Props>()

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsConfigSelector: jest.fn().mockReturnValue({
    agreements: {
      analytics: true,
    }
  }),
}))

describe('RecommendationVoting', () => {
  it('should render', () => {
    expect(render(<RecommendationVoting {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call "setRecommendationVote" action be called after click "very-useful-vote-btn"', () => {
    render(<RecommendationVoting {...instance(mockedProps)} />)
    expect(screen.queryByTestId('very-useful-vote-btn')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('very-useful-vote-btn'))

    const expectedActions = [setRecommendationVote()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call "setRecommendationVote" action be called after click "useful-vote-btn"', () => {
    render(<RecommendationVoting {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('useful-vote-btn'))

    const expectedActions = [setRecommendationVote()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call "setRecommendationVote" action be called after click "not-useful-vote-btn"', () => {
    render(<RecommendationVoting {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('not-useful-vote-btn'))

    const expectedActions = [setRecommendationVote()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render popover after click "not-useful-vote-btn"', async () => {
    render(<RecommendationVoting {...instance(mockedProps)} />)

    expect(document.querySelector('[data-test-subj="github-repo-link"]')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('not-useful-vote-btn'))
    await waitForEuiPopoverVisible()

    expect(document.querySelector('[data-test-subj="github-repo-link"]')).toHaveAttribute('href', 'https://github.com/RedisInsight/RedisInsight/issues/new/choose')
  })

  it('should render component where all buttons are disabled"', async () => {
    render(<RecommendationVoting {...instance(mockedProps)} vote={Vote.Like} />)

    expect(screen.getByTestId('very-useful-vote-btn')).toBeDisabled()
    expect(screen.getByTestId('useful-vote-btn')).toBeDisabled()
    expect(screen.getByTestId('not-useful-vote-btn')).toBeDisabled()
  })

  it('should render popover after click "not-useful-vote-btn"', async () => {
    userSettingsConfigSelector.mockImplementation(() => ({
      agreements: {
        analytics: false,
      },
    }))
    render(<RecommendationVoting {...instance(mockedProps)} />)

    await act(async () => {
      fireEvent.mouseOver(screen.getByTestId('not-useful-vote-btn'))
    })
    await waitForEuiToolTipVisible()

    expect(screen.getByTestId('not-useful-vote-tooltip')).toHaveTextContent('Enable Analytics on the Settings page to vote for a recommendation')
  })
})
