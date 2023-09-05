import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep, toString } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { Instance } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import { defaultInstanceChanging } from 'uiSrc/slices/instances/instances'
import InstanceFormWrapper, { Props } from './InstanceFormWrapper'
import InstanceForm, { Props as InstanceProps, } from './InstanceForm/InstanceForm'

const mockedProps = mock<Props>()
const mockedEditedInstance: Instance = {
  name: 'name',
  host: 'host',
  port: 123,
  timeout: 10_000,
  id: '123',
  modules: [],
  tls: true,
  caCert: { id: 'zxc' },
  clientCert: { id: 'zxc' },
}

const mockedValues = {
  newCaCert: '',
  tls: true,
  newCaCertName: '',
  selectedCaCertName: '',
  tlsClientAuthRequired: false,
  verifyServerTlsCert: true,
  newTlsCertPairName: '',
  selectedTlsClientCertId: '',
  newTlsClientCert: '',
  newTlsClientKey: '',
}

jest.mock('./InstanceForm/InstanceForm', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  updateInstanceAction: () => jest.fn,
  testInstanceStandaloneAction: () => jest.fn,
  instancesSelector: jest.fn().mockReturnValue({ loadingChanging: false }),
}))

jest.mock('uiSrc/slices/instances/clientCerts', () => ({
  clientCertsSelector: () => jest.fn().mockReturnValue({ data: [] }),
  fetchClientCerts: jest.fn,
}))

jest.mock('uiSrc/slices/instances/caCerts', () => ({
  caCertsSelector: () => jest.fn().mockReturnValue({ data: [] }),
  fetchCaCerts: () => jest.fn,
}))

jest.mock('uiSrc/slices/instances/sentinel', () => ({
  sentinelSelector: () => jest.fn().mockReturnValue({ loading: false }),
  fetchMastersSentinelAction: () => jest.fn,
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const MockInstanceForm = (props: InstanceProps) => (
  <div>
    <button
      type="button"
      data-testid="btn-test-connection"
      onClick={() => props.onTestConnection(mockedValues)}
    >
      onTestConnection
    </button>
    <button type="button" data-testid="close-btn" onClick={() => props.onClose()}>
      onClose
    </button>
    <button
      type="button"
      data-testid="submit-form-btn"
      onClick={() => props.onSubmit(mockedValues)}
    >
      onSubmit
    </button>
    <button
      type="button"
      data-testid="paste-hostName-btn"
      onClick={() => props.onHostNamePaste('')}
    >
      onHostNamePaste
    </button>
  </div>
)

describe('InstanceFormWrapper', () => {
  beforeAll(() => {
    InstanceForm.mockImplementation(MockInstanceForm)
  })
  it('should render', () => {
    expect(
      render(
        <InstanceFormWrapper
          {...instance(mockedProps)}
          editedInstance={mockedEditedInstance}
        />
      )
    ).toBeTruthy()
  })

  it('should send prop timeout / 1_000 (in seconds)', () => {
    expect(
      render(
        <InstanceFormWrapper
          {...instance(mockedProps)}
          editedInstance={mockedEditedInstance}
        />
      )
    ).toBeTruthy()

    expect(InstanceForm).toHaveBeenCalledWith(
      expect.objectContaining({
        formFields: expect.objectContaining({
          timeout: toString(mockedEditedInstance?.timeout / 1_000),
        }),
      }),
      {},
    )
  })

  it('should call onClose', () => {
    const onClose = jest.fn()
    render(
      <InstanceFormWrapper
        {...instance(mockedProps)}
        editedInstance={mockedEditedInstance}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByTestId('close-btn'))
    expect(onClose).toBeCalled()
  })

  it('should submit with editMode', () => {
    const component = render(
      <InstanceFormWrapper
        {...instance(mockedProps)}
        editedInstance={mockedEditedInstance}
        editMode
      />
    )
    fireEvent.click(screen.getByTestId('submit-form-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onHostNamePaste', () => {
    const component = render(
      <InstanceFormWrapper
        {...instance(mockedProps)}
        editedInstance={mockedEditedInstance}
        editMode
      />
    )
    fireEvent.click(screen.getByTestId('paste-hostName-btn'))
    expect(component).toBeTruthy()
  })

  it('should call proper telemetry events after click test connection', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(
      <InstanceFormWrapper
        {...instance(mockedProps)}
        editedInstance={mockedEditedInstance}
      />
    )
    fireEvent.click(screen.getByTestId('btn-test-connection'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_TEST_CONNECTION_CLICKED,
    })
    sendEventTelemetry.mockRestore()
  })

  it('should call proper actions onSubmit with url handling', () => {
    render(
      <InstanceFormWrapper
        {...instance(mockedProps)}
        urlHandlingAction={UrlHandlingActions.Connect}
        initialValues={mockedEditedInstance}
      />
    )
    fireEvent.click(screen.getByTestId('submit-form-btn'))
    expect(store.getActions()).toEqual([
      defaultInstanceChanging()
    ])
  })
})
