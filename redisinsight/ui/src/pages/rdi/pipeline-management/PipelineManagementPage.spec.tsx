import React from 'react'
import { cloneDeep } from 'lodash'

import reactRouterDom, { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'
import { useFormikContext } from 'formik'
import { rest } from 'msw'
import { waitFor } from '@testing-library/react'
import {
  render,
  cleanup,
  mockedStore,
  initialStateDefault,
  screen,
  getMswURL,
} from 'uiSrc/utils/test-utils'
import {
  appContextPipelineManagement,
  setLastPageContext,
  setLastPipelineManagementPage,
} from 'uiSrc/slices/app/context'
import { ApiEndpoints, PageNames, Pages } from 'uiSrc/constants'
import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { mswServer } from 'uiSrc/mocks/server'
import { getPipeline, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { getRdiUrl } from 'uiSrc/utils'
import PipelineManagementPage, { Props } from './PipelineManagementPage'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextPipelineManagement: jest.fn().mockReturnValue({
    lastViewedPage: '',
  }),
}))

jest.mock('formik')

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(rdiPipelineSelector as jest.Mock).mockReturnValue(
    initialStateDefault.rdi.pipeline,
  )
})

describe('PipelineManagementPage', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      setFieldValue: jest.fn,
      values: MOCK_RDI_PIPELINE_DATA,
    }
    ;(useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(
      render(
        <BrowserRouter>
          <PipelineManagementPage {...instance(mockedProps)} />
        </BrowserRouter>,
      ),
    ).toBeTruthy()
  })

  it('should redirect to the config tab by default', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    reactRouterDom.useLocation = jest.fn().mockReturnValue({
      pathname: Pages.rdiPipelineManagement('rdiInstanceId'),
    })

    render(
      <BrowserRouter>
        <PipelineManagementPage {...instance(mockedProps)} />
      </BrowserRouter>,
    )

    expect(pushMock).toBeCalledWith(Pages.rdiPipelineConfig('rdiInstanceId'))
  })

  it('should redirect to the prev page from context', () => {
    ;(appContextPipelineManagement as jest.Mock).mockReturnValueOnce({
      lastViewedPage: Pages.rdiPipelineConfig('rdiInstanceId'),
    })
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    reactRouterDom.useLocation = jest.fn().mockReturnValue({
      pathname: Pages.rdiPipelineManagement('rdiInstanceId'),
    })

    render(
      <BrowserRouter>
        <PipelineManagementPage {...instance(mockedProps)} />
      </BrowserRouter>,
    )

    expect(pushMock).toBeCalledWith(Pages.rdiPipelineConfig('rdiInstanceId'))
  })

  it('should save proper page on unmount', () => {
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      ...initialStateDefault.rdi.pipeline,
      loading: false,
    })

    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.rdiPipelineConfig('rdiInstanceId') })

    const { unmount } = render(
      <BrowserRouter>
        <PipelineManagementPage {...instance(mockedProps)} />
      </BrowserRouter>,
    )

    unmount()
    const expectedActions = [
      getPipeline(),
      setLastPageContext(PageNames.rdiPipelineManagement),
      setLastPipelineManagementPage(Pages.rdiPipelineConfig('rdiInstanceId')),
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
  })

  it('should show source pipeline dialog when server returned empty config', async () => {
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      ...initialStateDefault.rdi.pipeline,
      loading: false,
      config: '',
    })

    mswServer.use(
      rest.get(
        getMswURL(getRdiUrl('rdiInstanceId', ApiEndpoints.RDI_PIPELINE)),
        async (_req, res, ctx) =>
          res(
            ctx.status(200),
            ctx.json({
              config: {},
              jobs: [],
            }),
          ),
      ),
    )
    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.rdiPipelineConfig('rdiInstanceId') })

    render(
      <BrowserRouter>
        <PipelineManagementPage {...instance(mockedProps)} />
      </BrowserRouter>,
    )

    await waitFor(async () => {
      await new Promise(res => setTimeout(res, 500))
      expect(
        screen.queryByTestId('rdi-pipeline-source-dialog'),
      ).toBeInTheDocument()
    })
  })
})
