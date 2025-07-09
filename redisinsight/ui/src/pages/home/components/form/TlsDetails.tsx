import React, { ChangeEvent, useState } from 'react'
import { EuiFieldText, htmlIdGenerator } from '@elastic/eui'
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
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextArea } from 'uiSrc/components/base/inputs'
import {
  RiSelect,
  SelectValueRender,
  RiSelectOption,
} from 'uiSrc/components/base/forms/select/RiSelect'
import styles from '../styles.module.scss'

const suffix = '_tls_details'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  caCertificates?: { id: string; name: string }[]
  certificates?: { id: number; name: string }[]
}
const valueRender: SelectValueRender = ({ option, isOptionValue }) => {
  if (isOptionValue) {
    return (option.dropdownDisplay ?? option.inputDisplay) as JSX.Element
  }
  return option.inputDisplay as JSX.Element
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

  const optionsCertsCA: RiSelectOption[] = [
    {
      value: NO_CA_CERT,
      inputDisplay: <span>No CA Certificate</span>,
      dropdownDisplay: null,
    },
    {
      value: ADD_NEW_CA_CERT,
      inputDisplay: <span>Add new CA certificate</span>,
      dropdownDisplay: null,
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

  const optionsCertsClient: RiSelectOption[] = [
    {
      value: 'ADD_NEW',
      inputDisplay: <span>Add new certificate</span>,
      dropdownDisplay: null,
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
          <Checkbox
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
              <Checkbox
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
                  <FormField label="Server Name*">
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
                  </FormField>
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
              <Checkbox
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
            <FlexItem>
              <FormField
                label={`CA Certificate${
                  formik.values.verifyServerTlsCert ? '*' : ''
                }`}
              >
                <RiSelect
                  name="selectedCaCertName"
                  placeholder="Select CA certificate"
                  value={formik.values.selectedCaCertName ?? NO_CA_CERT}
                  options={optionsCertsCA}
                  valueRender={valueRender}
                  onChange={(value) => {
                    formik.setFieldValue(
                      'selectedCaCertName',
                      value || NO_CA_CERT,
                    )
                  }}
                  data-testid="select-ca-cert"
                />
              </FormField>
            </FlexItem>

            {formik.values.tls &&
              formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
                <FlexItem grow>
                  <FormField label="Name*">
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
                  </FormField>
                </FlexItem>
              )}
          </Row>

          {formik.values.tls &&
            formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
              <Row gap="m" responsive>
                <FlexItem grow>
                  <FormField label="Certificate*">
                    <TextArea
                      name="newCaCert"
                      id="newCaCert"
                      value={formik.values.newCaCert ?? ''}
                      onChangeCapture={formik.handleChange}
                      placeholder="Enter CA Certificate"
                      data-testid="new-ca-cert"
                    />
                  </FormField>
                </FlexItem>
              </Row>
            )}
        </div>
      )}
      {formik.values.tls && (
        <Row responsive style={{ margin: '20px 0 20px' }}>
          <FlexItem grow>
            <Checkbox
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
              <FormField label="Client Certificate*">
                <RiSelect
                  placeholder="Select certificate"
                  value={formik.values.selectedTlsClientCertId}
                  options={optionsCertsClient}
                  valueRender={valueRender}
                  onChange={(value) => {
                    formik.setFieldValue('selectedTlsClientCertId', value)
                  }}
                  data-testid="select-cert"
                />
              </FormField>
            </FlexItem>

            {formik.values.tls &&
              formik.values.tlsClientAuthRequired &&
              formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
                <FlexItem grow>
                  <FormField label="Name*">
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
                  </FormField>
                </FlexItem>
              )}
          </Row>

          {formik.values.tls &&
            formik.values.tlsClientAuthRequired &&
            formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
              <>
                <Row gap="m" responsive>
                  <FlexItem grow>
                    <FormField label="Certificate*">
                      <TextArea
                        name="newTlsClientCert"
                        id="newTlsClientCert"
                        value={formik.values.newTlsClientCert}
                        onChangeCapture={formik.handleChange}
                        draggable={false}
                        placeholder="Enter Client Certificate"
                        data-testid="new-tls-client-cert"
                      />
                    </FormField>
                  </FlexItem>
                </Row>

                <Row gap="m" responsive>
                  <FlexItem grow>
                    <FormField label="Private Key*">
                      <TextArea
                        placeholder="Enter Private Key"
                        name="newTlsClientKey"
                        id="newTlsClientKey"
                        value={formik.values.newTlsClientKey}
                        onChangeCapture={formik.handleChange}
                        data-testid="new-tls-client-cert-key"
                      />
                    </FormField>
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
