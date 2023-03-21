import { cloneDeep } from 'lodash'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'

import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import InstancePage, { getDefaultSizes, Props } from './InstancePage'

const mockedProps = mock<Props>()

jest.mock('uiSrc/services', () => ({
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * InstancePage tests
 *
 * @group component
 */
describe('InstancePage', () => {
  it('should render', () => {
    expect(
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>
      )
    ).toBeTruthy()
  })

  it('should render with CLI Header Minimized Component', () => {
    const { queryByTestId } = render(
      <BrowserRouter>
        <InstancePage {...instance(mockedProps)} />
      </BrowserRouter>
    )

    expect(queryByTestId('expand-cli')).toBeInTheDocument()
  })

  it('should render with LiveTimeRecommendations Component', () => {
    const { queryByTestId } = render(
      <BrowserRouter>
        <InstancePage {...instance(mockedProps)} />
      </BrowserRouter>
    )

    expect(queryByTestId('recommendations-trigger')).toBeInTheDocument()
  })

  it('should be called LocalStorage after Component Will Unmount', () => {
    const defaultSizes = getDefaultSizes()
    localStorageService.set = jest.fn()

    const { unmount } = render(
      <BrowserRouter>
        <InstancePage {...instance(mockedProps)} />
      </BrowserRouter>
    )

    unmount()

    expect(localStorageService.set).toBeCalledWith(
      BrowserStorageItem.cliResizableContainer,
      defaultSizes
    )
  })
})
