import React from 'react'

import { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import TriggeredFunctionsPage, { Props } from './TriggeredFunctionsPage'

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
})
