import React from 'react'

import reactRouterDom, { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import { appContextTriggeredFunctions, setLastTriggeredFunctionsPage } from 'uiSrc/slices/app/context'
import TriggeredFunctionsPage, { Props } from './TriggeredFunctionsPage'

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextTriggeredFunctions: jest.fn().mockReturnValue({
    lastViewedPage: '',
  }),
}))

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * AnalyticsPage tests
 *
 * @group component
 */
describe('TriggeredFunctionsPage', () => {
  it('should render', () => {
    expect(
      render(
        <BrowserRouter>
          <TriggeredFunctionsPage {...instance(mockedProps)} />
        </BrowserRouter>
      )
    ).toBeTruthy()
  })

  it('should redirect to the functions by default', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.triggeredFunctions('instanceId') })

    render(
      <BrowserRouter>
        <TriggeredFunctionsPage {...instance(mockedProps)} />
      </BrowserRouter>
    )

    expect(pushMock).toBeCalledWith(Pages.triggeredFunctionsFunctions('instanceId'))
  })

  it('should redirect to the prev page from context', () => {
    (appContextTriggeredFunctions as jest.Mock).mockReturnValueOnce({
      lastViewedPage: Pages.triggeredFunctionsLibraries('instanceId')
    })
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.triggeredFunctions('instanceId') })

    render(
      <BrowserRouter>
        <TriggeredFunctionsPage {...instance(mockedProps)} />
      </BrowserRouter>
    )

    expect(pushMock).toBeCalledWith(Pages.triggeredFunctionsLibraries('instanceId'))
  })

  it('should save proper page on unmount', () => {
    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.triggeredFunctionsLibraries('instanceId') })

    const { unmount } = render(
      <BrowserRouter>
        <TriggeredFunctionsPage {...instance(mockedProps)} />
      </BrowserRouter>
    )

    unmount()
    expect(store.getActions()).toEqual([setLastTriggeredFunctionsPage(Pages.triggeredFunctionsLibraries('instanceId'))])
  })
})
