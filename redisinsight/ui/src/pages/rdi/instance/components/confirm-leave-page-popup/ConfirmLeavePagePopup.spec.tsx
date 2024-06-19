import React from 'react'
import { useFormikContext } from 'formik'
import { render, fireEvent, screen } from 'uiSrc/utils/test-utils'
import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import ConfirmLeavePagePopup, { Props } from './ConfirmLeavePagePopup'

const mockProps: Props = {
  onClose: jest.fn(),
  onConfirm: jest.fn()
}

jest.mock('formik')

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn()
}))

describe('ConfirmLeavePagePopup', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      setFieldValue: jest.fn,
      values: MOCK_RDI_PIPELINE_DATA,
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<ConfirmLeavePagePopup {...mockProps} />)).toBeTruthy()
  })

  it('should call proper telemetry event', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<ConfirmLeavePagePopup {...mockProps} />)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_UNSAVED_CHANGES_MESSAGE_DISPLAYED,
      eventData: {
        id: 'rdiInstanceId',
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call onConfirm', async () => {
    const onConfirmMock = jest.fn()
    render(<ConfirmLeavePagePopup {...mockProps} onConfirm={onConfirmMock} />)

    fireEvent.click(screen.getByTestId('confirm-leave-page'))

    expect(onConfirmMock).toBeCalled()
  })
})
