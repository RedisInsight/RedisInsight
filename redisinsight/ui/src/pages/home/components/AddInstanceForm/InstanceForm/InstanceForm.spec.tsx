import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import InstanceForm, {
  ADD_NEW_CA_CERT,
  DbConnectionInfo,
  Props,
} from './InstanceForm'

const BTN_SUBMIT = 'btn-submit'
const NEW_CA_CERT = 'new-ca-cert'
const QA_CA_CERT = 'qa-ca-cert'

const mockedProps = mock<Props>()
const mockedDbConnectionInfo = mock<DbConnectionInfo>()

const formFields = {
  ...instance(mockedDbConnectionInfo),
  host: 'localhost',
  port: 6379,
  name: 'lala',
  caCertificates: [],
  certificates: [],
}

jest.mock('uiSrc/slices/instances/instances', () => ({
  checkConnectToInstanceAction: () => jest.fn,
  resetInstanceUpdateAction: () => jest.fn,
  changeInstanceAliasAction: () => jest.fn,
  setConnectedInstanceId: jest.fn,
}))

describe('InstanceForm', () => {
  it('should render', () => {
    expect(
      render(
        <InstanceForm {...instance(mockedProps)} formFields={formFields} />
      )
    ).toBeTruthy()
  })

  it('should render with ConnectionType.Sentinel', () => {
    expect(
      render(
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Sentinel,
          }}
        />
      )
    ).toBeTruthy()
  })

  it('should render with ConnectionType.Cluster', () => {
    expect(
      render(
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{ ...formFields, connectionType: ConnectionType.Cluster }}
        />
      )
    ).toBeTruthy()
  })

  it('should render tooltip with endpoints', () => {
    expect(
      render(
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            endpoints: [{ host: '1', port: 1 }],
            connectionType: ConnectionType.Cluster,
          }}
        />
      )
    ).toBeTruthy()
  })

  it('should render DatabaseForm', () => {
    expect(
      render(
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode={false}
          formFields={{
            ...formFields,
            tls: {
              caCertId: '123',
            },
            host: '123',
            tlsClientAuthRequired: true,
            endpoints: [{ host: '1', port: 1 }],
            connectionType: ConnectionType.Cluster,
          }}
        />
      )
    ).toBeTruthy()
  })

  it('should change sentinelMasterUsername input properly', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Sentinel,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )

    await act(() => {
      fireEvent.change(screen.getByTestId('sentinel-mater-username'), {
        target: { value: 'user' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(() => {
      fireEvent.click(submitBtn)
    })
    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        sentinelMasterUsername: 'user',
      })
    )
  })

  it('should change tls checkbox', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )

    fireEvent.click(screen.getByTestId('tls'))

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        tls: ['on'],
      })
    )
  })

  it('should change Database Index checkbox', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )

    fireEvent.click(screen.getByTestId('showDb'))

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        showDb: true,
      })
    )
  })

  it('should change tls checkbox', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )

    fireEvent.click(screen.getByTestId('showDb'))

    await act(() => {
      fireEvent.change(screen.getByTestId('db'), {
        target: { value: '12' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        showDb: true,
        db: '12'
      })
    )
  })

  it('should change "Use SNI" with prepopulated with host', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: {},
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )
    fireEvent.click(screen.getByTestId('sni'))

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        sni: true,
        servername: formFields.host
      })
    )
  })

  it('should change "Use SNI"', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: {},
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )
    fireEvent.click(screen.getByTestId('sni'))

    await act(() => {
      fireEvent.change(screen.getByTestId('sni-servername'), {
        target: { value: '12' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        sni: true,
        servername: '12'
      })
    )
  })

  it('should change "Verify TLS Certificate"', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: {},
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )
    fireEvent.click(screen.getByTestId('verify-tls-cert'))

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        verifyServerTlsCert: ['on'],
      })
    )
  })

  it('should select value from "CA Certificate"', async () => {
    const handleSubmit = jest.fn()
    const { queryByText } = render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: {},
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )
    await act(() => {
      fireEvent.click(screen.getByTestId('select-ca-cert'))
    })
    await act(() => {
      fireEvent.click(queryByText('Add new CA certificate') || document)
    })

    expect(screen.getByTestId(NEW_CA_CERT)).toBeInTheDocument()
    await act(() => {
      fireEvent.change(screen.getByTestId(NEW_CA_CERT), {
        target: { value: '123' },
      })
    })

    expect(screen.getByTestId(QA_CA_CERT)).toBeInTheDocument()
    await act(() => {
      fireEvent.change(screen.getByTestId(QA_CA_CERT), {
        target: { value: '321' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        selectedCaCertName: ADD_NEW_CA_CERT,
        newCaCertName: '321',
        newCaCert: '123',
      })
    )
  })

  it('should render fields for add new CA and change them properly', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: {},
            connectionType: ConnectionType.Cluster,
            selectedCaCertName: 'ADD_NEW_CA_CERT',
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )

    expect(screen.getByTestId(QA_CA_CERT)).toBeInTheDocument()
    fireEvent.change(screen.getByTestId(QA_CA_CERT), {
      target: { value: '321' },
    })

    expect(screen.getByTestId(NEW_CA_CERT)).toBeInTheDocument()
    fireEvent.change(screen.getByTestId(NEW_CA_CERT), {
      target: { value: '123' },
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)

    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        newCaCert: '123',
        newCaCertName: '321',
      })
    )
  })

  it('should change "Requires TLS Client Authentication"', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: {},
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )
    fireEvent.click(screen.getByTestId('tls-required-checkbox'))

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        tlsClientAuthRequired: ['on'],
      })
    )
  })

  it('should render fields for add new CA with required tls auth and change them properly', async () => {
    const handleSubmit = jest.fn()
    const { container } = render(
      <div id="footerDatabaseForm">
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: {},
            connectionType: ConnectionType.Standalone,
            selectedCaCertName: 'NO_CA_CERT',
            tlsClientAuthRequired: true,
            selectedTlsClientCertId: 'ADD_NEW',
          }}
          onSubmit={handleSubmit}
        />
      </div>
    )

    expect(screen.getByTestId('select-cert')).toBeInTheDocument()

    await act(() => {
      fireEvent.click(screen.getByTestId('select-cert'))
    })

    await act(() => {
      fireEvent.click(
        container.querySelectorAll('.euiContextMenuItem__text')[0] || document
      )
    })

    expect(screen.getByTestId('new-tsl-cert-pair-name')).toBeInTheDocument()
    await act(() => {
      fireEvent.change(screen.getByTestId('new-tsl-cert-pair-name'), {
        target: { value: '123' },
      })
    })

    expect(screen.getByTestId('new-tls-client-cert')).toBeInTheDocument()
    await act(() => {
      fireEvent.change(screen.getByTestId('new-tls-client-cert'), {
        target: { value: '321' },
      })
    })

    expect(screen.getByTestId('new-tls-client-cert-key')).toBeInTheDocument()
    await act(() => {
      fireEvent.change(screen.getByTestId('new-tls-client-cert-key'), {
        target: { value: '231' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)

    await act(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        newTlsClientCert: '321',
        newTlsCertPairName: '123',
        newTlsClientKey: '231',
      })
    )
  })

  it('should render clone mode btn', () => {
    render(
      <InstanceForm
        {...instance(mockedProps)}
        isEditMode
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
        }}
      />
    )
    expect(screen.getByTestId('clone-db-btn')).toBeTruthy()
  })

  describe('should render proper fields with Clone mode', () => {
    it('should render proper fields for standalone db', () => {
      render(
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
        />
      )
      const fieldsTestIds = ['host', 'port', 'username', 'password', 'showDb', 'tls']
      fieldsTestIds.forEach((id) => {
        expect(screen.getByTestId(id)).toBeTruthy()
      })
    })

    it('should render proper fields for sentinel db', () => {
      render(
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Sentinel,
          }}
        />
      )
      const fieldsTestIds = [
        'name',
        'primary-group',
        'sentinel-mater-username',
        'sentinel-master-password',
        'host',
        'port',
        'username',
        'password',
        'showDb',
        'tls'
      ]
      fieldsTestIds.forEach((id) => {
        expect(screen.getByTestId(id)).toBeTruthy()
      })
    })

    it('should render selected logical database with proper db index', () => {
      render(
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
            db: 5
          }}
        />
      )
      expect(screen.getByTestId('showDb')).toBeChecked()
      expect(screen.getByTestId('db')).toHaveValue('5')
    })

    it('should render proper database alias', () => {
      render(
        <InstanceForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
        />
      )
      expect(screen.getByTestId('db-alias')).toHaveTextContent('Clone ')
    })
  })
})
