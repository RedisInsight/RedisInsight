import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { render, screen, fireEvent, mockedStore, cleanup } from 'uiSrc/utils/test-utils'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import { MOCKED_CREATE_REDIS_BTN_CONTENT } from 'uiSrc/mocks/content/content'
import { AddDbType } from 'uiSrc/pages/home/constants'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { MOCK_EXPLORE_GUIDES } from 'uiSrc/constants/mocks/mock-explore-guides'
import WelcomeComponent, { Props } from './WelcomeComponent'

jest.mock('uiSrc/slices/content/create-redis-buttons', () => ({
  ...jest.requireActual('uiSrc/slices/content/create-redis-buttons').initialState,
  contentSelector: jest.fn().mockReturnValue({ data: {}, loading: false }),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({}),
}))

jest.mock('uiSrc/slices/panels/insights', () => ({
  ...jest.requireActual('uiSrc/slices/panels/insights'),
  insightsPanelSelector: jest.fn().mockReturnValue({
    isOpen: true
  }),
}))

jest.mock('uiSrc/slices/content/guide-links', () => ({
  ...jest.requireActual('uiSrc/slices/content/guide-links'),
  guideLinksSelector: jest.fn().mockReturnValue({
    data: MOCK_EXPLORE_GUIDES
  })
}))

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('WelcomeComponent', () => {
  it('should render', () => {
    expect(
      render(<WelcomeComponent {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  it('should render proper content', () => {
    (contentSelector as jest.Mock).mockReturnValueOnce({
      data: MOCKED_CREATE_REDIS_BTN_CONTENT,
      loading: false
    })
    render(<WelcomeComponent {...instance(mockedProps)} />)

    expect(screen.getByTestId('promo-btn')).toHaveTextContent([
      MOCKED_CREATE_REDIS_BTN_CONTENT.cloud.title,
      MOCKED_CREATE_REDIS_BTN_CONTENT.cloud.description,
    ].join(''))

    expect(screen.getByTestId('guide-links')).toHaveTextContent([
      'Follow the guides',
      MOCKED_CREATE_REDIS_BTN_CONTENT.source.title,
      MOCKED_CREATE_REDIS_BTN_CONTENT.docker.title,
      MOCKED_CREATE_REDIS_BTN_CONTENT.homebrew.title,
    ].join(''))
  })

  it('should call proper props on click button', () => {
    const addInstance = jest.fn()
    render(<WelcomeComponent {...instance(mockedProps)} onAddInstance={addInstance} />)

    fireEvent.click(screen.getByTestId('add-db-manually-btn'))
    expect(addInstance).toBeCalledWith(AddDbType.manual)

    fireEvent.click(screen.getByTestId('add-db-auto-btn'))
    expect(addInstance).toBeCalledWith(AddDbType.auto)
  })

  it('should open import db dialog', () => {
    render(<WelcomeComponent {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('import-from-file-btn'))

    expect(screen.getByTestId('import-dbs-dialog')).toBeInTheDocument()
  })

  it('should not render import oath cloud db btn', () => {
    render(<WelcomeComponent {...instance(mockedProps)} />)

    expect(screen.queryByTestId('import-cloud-db-btn')).not.toBeInTheDocument()
  })

  it('should call open social oauth dialog', () => {
    (appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      cloudSso: {
        flag: true
      }
    })
    render(<WelcomeComponent {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('import-cloud-db-btn'))

    expect(store.getActions()).toEqual([setSocialDialogState(OAuthSocialSource.WelcomeScreen)])
  })

  it('should render capability promotion component', () => {
    render(<WelcomeComponent {...instance(mockedProps)} />)

    expect(screen.queryByTestId('capability-promotion')).toBeInTheDocument()
  })

  it('should render insights panel', () => {
    render(<WelcomeComponent {...instance(mockedProps)} />)

    expect(screen.queryByTestId('insights-panel')).toBeInTheDocument()
  })
})
