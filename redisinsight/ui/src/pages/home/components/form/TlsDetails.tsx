import React, { ChangeEvent, useState } from 'react'
import {
  EuiCheckbox,
  EuiFieldText,
  EuiFormRow,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiTextArea,
  htmlIdGenerator,
} from '@elastic/eui'
import cx from 'classnames'
import { FormikProps } from 'formik'

import { useDispatch } from 'react-redux'
import {
  Nullable,
  truncateText,
  validateCertName,
  validateField,
} from 'uiSrc/utils'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'

import {
  ADD_NEW,
  ADD_NEW_CA_CERT,
  NO_CA_CERT,
} from 'uiSrc/pages/home/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { deleteCaCertificateAction } from 'uiSrc/slices/instances/caCerts'
import { deleteClientCertAction } from 'uiSrc/slices/instances/clientCerts'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import styles from '../styles.module.scss'

const suffix = '_tls_details'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  caCertificates?: { id: string; name: string }[]
  certificates?: { id: number; name: string }[]
}

const TlsDetails = (props: Props) => {
  const dispatch = useDispatch()
  const { formik, caCertificates, certificates } = props
  const [activeCertId, setActiveCertId] = useState<Nullable<string>>(null)

  const handleDeleteCaCert = (id: string) => {
    dispatch(
      deleteCaCertificateAction(id, () => {
        if (formik.values.selectedCaCertName === id) {
          formik.setFieldValue('selectedCaCertName', NO_CA_CERT)
        }
        handleClickDeleteCert('CA')
      }),
    )
  }

  const handleDeleteClientCert = (id: string) => {
    dispatch(
      deleteClientCertAction(id, () => {
        if (formik.values.selectedTlsClientCertId === id) {
          formik.setFieldValue('selectedTlsClientCertId', ADD_NEW)
        }
        handleClickDeleteCert('Client')
      }),
    )
  }

  const handleClickDeleteCert = (certificateType: 'Client' | 'CA') => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CERTIFICATE_REMOVED,
      eventData: {
        certificateType,
      },
    })
  }

  const closePopover = () => {
    setActiveCertId(null)
  }

  const showPopover = (id: string) => {
    setActiveCertId(`${id}${suffix}`)
  }

  const optionsCertsCA: EuiSuperSelectOption<string>[] = [
    {
      value: NO_CA_CERT,
      inputDisplay: 'No CA Certificate',
    },
    {
      value: ADD_NEW_CA_CERT,
      inputDisplay: 'Add new CA certificate',
    },
  ]

  caCertificates?.forEach((cert) => {
    optionsCertsCA.push({
      value: cert.id,
      inputDisplay: (
        <span className={styles.selectedOptionWithLongTextSupport}>
          {cert.name}
        </span>
      ),
      dropdownDisplay: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>{truncateText(cert.name, 25)}</div>
          <PopoverDelete
            header={cert.name}
            text="will be removed from RedisInsight."
            item={cert.id}
            suffix={suffix}
            deleting={activeCertId}
            closePopover={closePopover}
            updateLoading={false}
            showPopover={showPopover}
            handleDeleteItem={handleDeleteCaCert}
            testid={`delete-ca-cert-${cert.id}`}
          />
        </div>
      ),
    })
  })

  const optionsCertsClient: EuiSuperSelectOption<string>[] = [
    {
      value: 'ADD_NEW',
      inputDisplay: 'Add new certificate',
    },
  ]

  certificates?.forEach((cert) => {
    optionsCertsClient.push({
      value: `${cert.id}`,
      inputDisplay: (
        <span className={styles.selectedOptionWithLongTextSupport}>
          {cert.name}
        </span>
      ),
      dropdownDisplay: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>{truncateText(cert.name, 25)}</div>
          <PopoverDelete
            header={cert.name}
            text="will be removed from RedisInsight."
            item={cert.id}
            suffix={suffix}
            deleting={activeCertId}
            closePopover={closePopover}
            updateLoading={false}
            showPopover={showPopover}
            handleDeleteItem={handleDeleteClientCert}
            testid={`delete-client-cert-${cert.id}`}
          />
        </div>
      ),
    })
  })

  return (
    <>
      <Row gap="m">
        <FlexItem grow={1}>
          <EuiCheckbox
            id={`${htmlIdGenerator()()} over ssl`}
            name="tls"
            label="Use TLS"
            checked={!!formik.values.tls}
            onChange={formik.handleChange}
            data-testid="tls"
          />
        </FlexItem>
      </Row>

      {formik.values.tls && (
        <>
          <Spacer />
          <Row gap="m">
            <FlexItem grow={1}>
              <EuiCheckbox
                id={`${htmlIdGenerator()()} sni`}
                name="sni"
                label="Use SNI"
                checked={!!formik.values.sni}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    'servername',
                    formik.values.servername ?? formik.values.host ?? '',
                  )
                  return formik.handleChange(e)
                }}
                data-testid="sni"
              />
            </FlexItem>
          </Row>
          {formik.values.sni && (
            <>
              <Spacer />
              <Row gap="m">
                <FlexItem grow>
                  <EuiFormRow label="Server Name*">
                    <EuiFieldText
                      name="servername"
                      id="servername"
                      fullWidth
                      maxLength={200}
                      placeholder="Enter Server Name"
                      value={formik.values.servername ?? ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        formik.setFieldValue(
                          e.target.name,
                          validateField(e.target.value.trim()),
                        )
                      }
                      data-testid="sni-servername"
                    />
                  </EuiFormRow>
                </FlexItem>
              </Row>
            </>
          )}
          <Spacer />
          <Row gap="m" responsive>
            <FlexItem
              grow
              className={cx({ [styles.fullWidth]: formik.values.sni })}
            >
              <EuiCheckbox
                id={`${htmlIdGenerator()()} verifyServerTlsCert`}
                name="verifyServerTlsCert"
                label="Verify TLS Certificate"
                checked={!!formik.values.verifyServerTlsCert}
                onChange={formik.handleChange}
                data-testid="verify-tls-cert"
              />
            </FlexItem>
          </Row>
        </>
      )}
      {formik.values.tls && (
        <div className="boxSection">
          <Spacer />
          <Row gap="m" responsive>
            <FlexItem grow>
              <EuiFormRow
                label={`CA Certificate${
                  formik.values.verifyServerTlsCert ? '*' : ''
                }`}
              >
                <EuiSuperSelect
                  name="selectedCaCertName"
                  placeholder="Select CA certificate"
                  valueOfSelected={
                    formik.values.selectedCaCertName ?? NO_CA_CERT
                  }
                  options={optionsCertsCA}
                  onChange={(value) => {
                    formik.setFieldValue(
                      'selectedCaCertName',
                      value || NO_CA_CERT,
                    )
                  }}
                  data-testid="select-ca-cert"
                />
              </EuiFormRow>
            </FlexItem>

            {formik.values.tls &&
              formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
                <FlexItem grow>
                  <EuiFormRow label="Name*">
                    <EuiFieldText
                      name="newCaCertName"
                      id="newCaCertName"
                      fullWidth
                      maxLength={200}
                      placeholder="Enter CA Certificate Name"
                      value={formik.values.newCaCertName ?? ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        formik.setFieldValue(
                          e.target.name,
                          validateCertName(e.target.value),
                        )
                      }
                      data-testid="qa-ca-cert"
                    />
                  </EuiFormRow>
                </FlexItem>
              )}
          </Row>

          {formik.values.tls &&
            formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
              <Row gap="m" responsive>
                <FlexItem grow>
                  <EuiFormRow label="Certificate*">
                    <EuiTextArea
                      name="newCaCert"
                      id="newCaCert"
                      className={styles.customScroll}
                      value={formik.values.newCaCert ?? ''}
                      onChange={formik.handleChange}
                      fullWidth
                      placeholder="Enter CA Certificate"
                      data-testid="new-ca-cert"
                    />
                  </EuiFormRow>
                </FlexItem>
              </Row>
            )}
        </div>
      )}
      {formik.values.tls && (
        <Row responsive style={{ margin: '20px 0 20px' }}>
          <FlexItem grow>
            <EuiCheckbox
              id={`${htmlIdGenerator()()} is_tls_client_auth_required`}
              name="tlsClientAuthRequired"
              label="Requires TLS Client Authentication"
              checked={!!formik.values.tlsClientAuthRequired}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue('tlsClientAuthRequired', e.target.checked)
              }
              data-testid="tls-required-checkbox"
            />
          </FlexItem>
        </Row>
      )}
      {formik.values.tls && formik.values.tlsClientAuthRequired && (
        <div
          className={cx('boxSection', styles.tslBoxSection)}
          style={{ marginTop: 15 }}
        >
          <Row gap="m" responsive>
            <FlexItem grow>
              <EuiFormRow label="Client Certificate*">
                <EuiSuperSelect
                  placeholder="Select certificate"
                  valueOfSelected={formik.values.selectedTlsClientCertId}
                  options={optionsCertsClient}
                  onChange={(value) => {
                    formik.setFieldValue('selectedTlsClientCertId', value)
                  }}
                  data-testid="select-cert"
                />
              </EuiFormRow>
            </FlexItem>

            {formik.values.tls &&
              formik.values.tlsClientAuthRequired &&
              formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
                <FlexItem grow>
                  <EuiFormRow label="Name*">
                    <EuiFieldText
                      name="newTlsCertPairName"
                      id="newTlsCertPairName"
                      fullWidth
                      maxLength={200}
                      placeholder="Enter Client Certificate Name"
                      value={formik.values.newTlsCertPairName ?? ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        formik.setFieldValue(
                          e.target.name,
                          validateCertName(e.target.value),
                        )
                      }
                      data-testid="new-tsl-cert-pair-name"
                    />
                  </EuiFormRow>
                </FlexItem>
              )}
          </Row>

          {formik.values.tls &&
            formik.values.tlsClientAuthRequired &&
            formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
              <>
                <Row gap="m" responsive>
                  <FlexItem grow>
                    <EuiFormRow label="Certificate*">
                      <EuiTextArea
                        name="newTlsClientCert"
                        id="newTlsClientCert"
                        className={styles.customScroll}
                        value={formik.values.newTlsClientCert}
                        onChange={formik.handleChange}
                        draggable={false}
                        fullWidth
                        placeholder="Enter Client Certificate"
                        data-testid="new-tls-client-cert"
                      />
                    </EuiFormRow>
                  </FlexItem>
                </Row>

                <Row gap="m" responsive>
                  <FlexItem grow>
                    <EuiFormRow label="Private Key*">
                      <EuiTextArea
                        placeholder="Enter Private Key"
                        name="newTlsClientKey"
                        id="newTlsClientKey"
                        className={styles.customScroll}
                        value={formik.values.newTlsClientKey}
                        onChange={formik.handleChange}
                        fullWidth
                        data-testid="new-tls-client-cert-key"
                      />
                    </EuiFormRow>
                  </FlexItem>
                </Row>
              </>
            )}
        </div>
      )}
    </>
  )
}

export default TlsDetails
