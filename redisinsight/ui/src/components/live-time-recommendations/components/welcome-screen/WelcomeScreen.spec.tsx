import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { setIsContentVisible } from 'uiSrc/slices/recommendations/recommendations'
import { fireEvent, mockedStore, screen, cleanup, render } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'

import WelcomeScreen from './WelcomeScreen'

let store: typeof mockedStore

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
  }),
}))

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('WelcomeScreen', () => {
  it('should render', () => {
    expect(render(<WelcomeScreen />)).toBeTruthy()
  })

  it('should properly push history on workbench page', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<WelcomeScreen />)

    fireEvent.click(screen.getByTestId('insights-db-analysis-link'))

    expect(pushMock).toHaveBeenCalledWith(Pages.databaseAnalysis('instanceId'))
  })

  it('should call "setIsContentVisible" after click close btn', () => {
    render(<WelcomeScreen />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('insights-db-analysis-link'))

    const expectedActions = [setIsContentVisible(false)]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
  })
})
