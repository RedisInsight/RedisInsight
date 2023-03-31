import { act } from '@testing-library/react'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { ApiEndpoints, MONACO_MANUAL } from 'uiSrc/constants'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import { resourcesService } from 'uiSrc/services'
import { EnablementAreaProvider, defaultValue } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'

import LazyCodeButton, { Props } from './LazyCodeButton'

const mockedProps = mock<Props>()

describe('LazyCodeButton', () => {
  it('should render', () => {
    const label = 'Manual'
    const component = render(
      <LazyCodeButton {...instance(mockedProps)} label={label} sourcePath={ApiEndpoints.TUTORIALS_PATH} />
    )
    const { container } = component

    expect(component).toBeTruthy()
    expect(container).toHaveTextContent(label)
  })
  it('should call setScript', async () => {
    const httpResponse = { status: 200, data: MONACO_MANUAL }
    const setScript = jest.fn()
    resourcesService.get = jest.fn().mockResolvedValue(httpResponse)

    const { queryByTestId } = render(
      <EnablementAreaProvider value={{ ...defaultValue, setScript }}>
        <LazyCodeButton label="script" path="/static/script.txt" sourcePath={ApiEndpoints.TUTORIALS_PATH} />
      </EnablementAreaProvider>
    )

    await act(() => {
      const button = queryByTestId('preselect-script')
      fireEvent.click(button as Element)
    })

    expect(setScript).toBeCalled()
  })
  it('should not call setScript on fetch error', async () => {
    const setScript = jest.fn()
    const httpResponse = {
      response: {
        status: 500,
        data: { message: 'Error' },
      },
    }
    resourcesService.get = jest.fn().mockRejectedValue(httpResponse)

    const { queryByTestId } = render(
      <EnablementAreaProvider value={{ ...defaultValue, setScript }}>
        <LazyCodeButton label="script" path="/static/script.txt" sourcePath={ApiEndpoints.TUTORIALS_PATH} />
      </EnablementAreaProvider>
    )

    await act(() => {
      const button = queryByTestId('preselect-script')
      fireEvent.click(button as Element)
    })

    expect(setScript).not.toBeCalled()
  })
})
