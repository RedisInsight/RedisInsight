import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import InstanceFormWrapper, { Props } from './InstanceFormWrapper'
import InstanceForm, {
  Props as InstanceProps,
} from './InstanceForm/InstanceForm'

const mockedProps = mock<Props>()
const mockedEditedInstance = {
  name: 'name',
  host: 'host',
  port: 123,
  tls: {
    caCertId: 'zxc',
    clientCertPairId: 'zxc',
  },
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

jest.mock('uiSrc/slices/instances', () => ({
  createInstanceStandaloneAction: () => jest.fn,
  updateInstanceAction: () => jest.fn,
  instancesSelector: jest.fn().mockReturnValue({ loadingChanging: false }),
}))

jest.mock('uiSrc/slices/clientCerts', () => ({
  clientCertsSelector: () => jest.fn().mockReturnValue({ data: [] }),
  fetchClientCerts: jest.fn,
}))

jest.mock('uiSrc/slices/caCerts', () => ({
  caCertsSelector: () => jest.fn().mockReturnValue({ data: [] }),
  fetchCaCerts: () => jest.fn,
}))

jest.mock('uiSrc/slices/sentinel', () => ({
  sentinelSelector: () => jest.fn().mockReturnValue({ loading: false }),
  fetchMastersSentinelAction: () => jest.fn,
}))

const MockInstanceForm = (props: InstanceProps) => (
  <div>
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

  it('should submit', () => {
    const onSubmit = jest.fn()
    render(
      <InstanceFormWrapper
        {...instance(mockedProps)}
        editedInstance={mockedEditedInstance}
        onDbAdded={onSubmit}
      />
    )
    fireEvent.click(screen.getByTestId('submit-form-btn'))
    expect(onSubmit).toBeCalled()
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
})
