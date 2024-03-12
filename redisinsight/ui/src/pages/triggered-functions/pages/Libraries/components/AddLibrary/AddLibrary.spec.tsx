import React from 'react'
import { mock } from 'ts-mockito'
import userEvent from '@testing-library/user-event'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { render, screen, fireEvent, act, waitFor } from 'uiSrc/utils/test-utils'

import AddLibrary, { IProps } from './AddLibrary'

const mockedProps = mock<IProps>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    instanceId: 'instanceId',
  }),
}))

describe('AddLibrary', () => {
  it('should render', () => {
    expect(render(<AddLibrary {...mockedProps} />)).toBeTruthy()
  })

  it('should display proper code value by default', () => {
    render(<AddLibrary {...mockedProps} />)

    expect(screen.getByTestId('code-value')).toHaveValue('#!js name=LibName api_version=1.0')
  })

  it('should call proper telemetry event', async () => {
    const onAdded = jest.fn()

    render(
      <AddLibrary {...mockedProps} onAdded={onAdded} />
    )
    fireEvent.change(screen.getByTestId('code-value'), { target: { value: 'code' } })

    await act(() => {
      fireEvent.click(screen.getByTestId('add-library-btn-submit'))
    })

    expect(onAdded).toBeCalled()
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_LOADED,
      eventData: {
        databaseId: 'instanceId'
      }
    })
  })

  it('should display configuration input', () => {
    render(<AddLibrary {...mockedProps} />)

    expect(screen.queryByTestId('configuration-value')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('show-configuration'))

    expect(screen.queryByTestId('configuration-value')).toBeInTheDocument()
  })

  it('should reset configuration input', () => {
    render(<AddLibrary {...mockedProps} />)

    fireEvent.click(screen.getByTestId('show-configuration'))

    fireEvent.change(screen.getByTestId('configuration-value'), { target: { value: 'config' } })

    expect(screen.queryByTestId('configuration-value')).toHaveValue('config')

    fireEvent.click(screen.getByTestId('show-configuration'))

    expect(screen.queryByTestId('configuration-value')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('show-configuration'))

    expect(screen.queryByTestId('configuration-value')).toHaveValue('')
  })

  it('should upload js code file', async () => {
    render(
      <AddLibrary {...mockedProps} />
    )

    const file = new File(['123'], 'empty.js', {
      type: 'application/javascript',
    })
    const fileInput = screen.getByTestId('upload-code-file')

    expect(fileInput).toHaveAttribute('accept', '.js, text/plain')

    await userEvent.upload(fileInput, file)

    await waitFor(() => expect(screen.getByTestId('code-value')).toHaveValue('123'))
  })

  it('should upload json configuration file', async () => {
    render(
      <AddLibrary {...mockedProps} />
    )

    fireEvent.click(screen.getByTestId('show-configuration'))

    const jsonString = JSON.stringify({ a: 12 })
    const blob = new Blob([jsonString])
    const file = new File([blob], 'empty.json', {
      type: 'application/JSON',
    })
    const fileInput = screen.getByTestId('upload-configuration-file')

    expect(fileInput).toHaveAttribute('accept', 'application/json, text/plain')

    await userEvent.upload(fileInput, file)

    await waitFor(() => expect(screen.getByTestId('configuration-value')).toHaveValue('{"a":12}'))
  })
})
