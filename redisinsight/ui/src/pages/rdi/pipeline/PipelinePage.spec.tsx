import React from 'react'
import { cloneDeep } from 'lodash'

import { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'
import { act, render, cleanup, mockedStore } from 'uiSrc/utils/test-utils'
import { getPipeline } from 'uiSrc/slices/rdi/pipeline'
import PipelinePage, { Props } from './PipelinePage'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('PipelinePage', () => {
  it('should render', () => {
    expect(
      render(
        <BrowserRouter>
          <PipelinePage {...instance(mockedProps)} />
        </BrowserRouter>
      )
    ).toBeTruthy()
  })

  it('should dispatch fetchRdiPipeline on render', async () => {
    await act(() => {
      render(
        <BrowserRouter>
          <PipelinePage {...instance(mockedProps)} />
        </BrowserRouter>
      )
    })

    const expectedActions = [
      getPipeline(),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })
})
