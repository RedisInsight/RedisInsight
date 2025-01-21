import React from 'react'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { cloneDeep, set } from 'lodash'
import { rest } from 'msw'
import { mswServer } from 'uiSrc/mocks/server'
import { getMswURL, initialStateDefault, mockStore, render } from 'uiSrc/utils/test-utils'
import InstanceConnectionLost from 'uiSrc/pages/instance/instanceConnectionLost'
import { ApiEndpoints } from 'uiSrc/constants'
import { INSTANCES_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { store } from 'uiSrc/slices/store'

const initialState = set(
  cloneDeep(initialStateDefault),
  'app.connectivity',
  {
    loading: false,
    error: 'Test error'
  }
)
const mockedStore = mockStore(initialState)

beforeEach(() => {
  jest.resetAllMocks()
  mockedStore.clearActions()
})

describe('instanceConnectionLost', () => {
  test.each([
    'success',
    'error'
  ])('should handle retry and %s', async (type) => {
    // mock actual store.dispatch so the axios error interceptor calls our mocked store's dispatch
    jest.spyOn(store, 'dispatch')
      .mockImplementation((action: unknown) => mockedStore.dispatch(action as any))

    mswServer.use(
      rest.get(
        getMswURL(`${ApiEndpoints.DATABASES}/instanceId/overview`),
        async (_, res, ctx) => {
          if (type === 'error') {
            return res(
              ctx.status(503),
              ctx.json({ error: 'test', code: 'serviceUnavailable' })
            )
          }

          return res(
            ctx.status(200),
            ctx.json(INSTANCES_MOCK),
          )
        }
      ),
    )

    render(<InstanceConnectionLost />, {
      store: mockedStore
    })

    const errorElement = screen.getByTestId('connectivity-error-message')
    expect(within(errorElement).getByText('Test error')).toBeInTheDocument()

    // click retry
    const retryButton = screen.getByRole('button', { name: 'Retry' })
    fireEvent.click(retryButton)

    // wait until the expected actions have beeen dispatched
    await waitFor(() => {
      if (type === 'error') {
        expect(mockedStore.getActions())
          .toEqual([
            { type: 'appConnectivity/setConnectivityLoading', payload: true },
            { type: 'instances/getDatabaseConfigInfo', payload: undefined },
            {
              type: 'appConnectivity/setConnectivityError',
              payload: 'The connection to the server has been lost.' // set by the Axios error interceptor
            },
            {
              type: 'instances/getDatabaseConfigInfoFailure',
              payload: undefined
            },
            { type: 'appConnectivity/setConnectivityLoading', payload: false }
          ])
      } else {
        expect(mockedStore.getActions()).toEqual([
          {
            payload: true,
            type: 'appConnectivity/setConnectivityLoading'
          },
          {
            type: 'instances/getDatabaseConfigInfo'
          },
          {
            payload: expect.anything(),
            type: 'instances/getDatabaseConfigInfoSuccess'
          },
          {
            payload: null,
            type: 'appConnectivity/setConnectivityError'
          },
          {
            payload: false,
            type: 'appConnectivity/setConnectivityLoading'
          }
        ])
      }
    })
  })
})
