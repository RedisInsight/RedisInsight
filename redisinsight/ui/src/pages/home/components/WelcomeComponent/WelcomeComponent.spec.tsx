import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import { MOCKED_CREATE_REDIS_BTN_CONTENT } from 'uiSrc/mocks/content/content'
import { AddDbType } from 'uiSrc/pages/home/components/AddDatabases/AddDatabasesContainer'
import WelcomeComponent, { Props } from './WelcomeComponent'

jest.mock('uiSrc/slices/content/create-redis-buttons', () => ({
  ...jest.requireActual('uiSrc/slices/content/create-redis-buttons').initialState,
  contentSelector: jest.fn().mockReturnValue({ data: {}, loading: false }),
}))

const mockedProps = mock<Props>()

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

  it('should open import db diaglog', () => {
    render(<WelcomeComponent {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('import-from-file-btn'))

    expect(screen.getByTestId('import-dbs-dialog')).toBeInTheDocument()
  })

  it('should open social oauth dialog', () => {
    render(<WelcomeComponent {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('import-cloud-db-btn'))

    expect(screen.getByTestId('social-oauth-dialog')).toBeInTheDocument()
  })
})
