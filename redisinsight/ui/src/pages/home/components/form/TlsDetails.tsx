import React, { ChangeEvent } from 'react'
import {
  EuiCheckbox,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiTextArea,
  htmlIdGenerator
} from '@elastic/eui'
import cx from 'classnames'
import { FormikProps } from 'formik'

import { validateCertName, validateField } from 'uiSrc/utils'

import {
  ADD_NEW_CA_CERT,
  NO_CA_CERT
} from 'uiSrc/pages/home/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

import styles from '../styles.module.scss'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
  caCertificates?: { id: string; name: string }[]
  certificates?: { id: number; name: string }[]
}
const TlsDetails = (props: Props) => {
  const { flexGroupClassName = '', flexItemClassName = '', formik, caCertificates, certificates } = props

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
      inputDisplay: cert.name,
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
      inputDisplay: cert.name,
    })
  })

  return (
    <>
      <EuiFlexGroup
        className={cx(flexGroupClassName, {
          [styles.tlsContainer]: !flexGroupClassName,
          [styles.tlsSniOpened]: formik.values.sni
        })}
        alignItems={!flexGroupClassName ? 'flexEnd' : undefined}
      >
        <EuiFlexItem
          style={{ width: '230px' }}
          grow={false}
          className={flexItemClassName}
        >
          <EuiCheckbox
            id={`${htmlIdGenerator()()} over ssl`}
            name="tls"
            label="Use TLS"
            checked={!!formik.values.tls}
            onChange={formik.handleChange}
            data-testid="tls"
          />
        </EuiFlexItem>

        {formik.values.tls && (
          <>
            <EuiFlexItem className={flexItemClassName}>
              <EuiCheckbox
                id={`${htmlIdGenerator()()} sni`}
                name="sni"
                label="Use SNI"
                checked={!!formik.values.sni}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    'servername',
                    formik.values.servername ?? formik.values.host ?? ''
                  )
                  return formik.handleChange(e)
                }}
                data-testid="sni"
              />
            </EuiFlexItem>
            {formik.values.sni && (
              <EuiFlexItem className={flexItemClassName} style={{ flexBasis: '255px', marginTop: 0 }}>
                <EuiFormRow label="Server Name*" style={{ paddingTop: 0 }}>
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
                        validateField(e.target.value.trim())
                      )}
                    data-testid="sni-servername"
                  />
                </EuiFormRow>
              </EuiFlexItem>
            )}
            <EuiFlexItem className={cx(flexItemClassName, { [styles.fullWidth]: formik.values.sni })}>
              <EuiCheckbox
                id={`${htmlIdGenerator()()} verifyServerTlsCert`}
                name="verifyServerTlsCert"
                label="Verify TLS Certificate"
                checked={!!formik.values.verifyServerTlsCert}
                onChange={formik.handleChange}
                data-testid="verify-tls-cert"
              />
            </EuiFlexItem>
          </>
        )}
      </EuiFlexGroup>
      {formik.values.tls && (
        <div className="boxSection">
          <EuiFlexGroup className={flexGroupClassName}>
            <EuiFlexItem className={flexItemClassName}>
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
                      value || NO_CA_CERT
                    )
                  }}
                  data-testid="select-ca-cert"
                />
              </EuiFormRow>
            </EuiFlexItem>

            {formik.values.tls
              && formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
                <EuiFlexItem className={flexItemClassName}>
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
                          validateCertName(e.target.value)
                        )}
                      data-testid="qa-ca-cert"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
            )}
          </EuiFlexGroup>

          {formik.values.tls
            && formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
              <EuiFlexGroup className={flexGroupClassName}>
                <EuiFlexItem className={flexItemClassName}>
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
                </EuiFlexItem>
              </EuiFlexGroup>
          )}
        </div>
      )}
      {formik.values.tls && (
        <EuiFlexGroup gutterSize="none" style={{ margin: '20px 0 20px' }}>
          <EuiFlexItem className={flexItemClassName}>
            <EuiCheckbox
              id={`${htmlIdGenerator()()} is_tls_client_auth_required`}
              name="tlsClientAuthRequired"
              label="Requires TLS Client Authentication"
              checked={!!formik.values.tlsClientAuthRequired}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue(
                  'tlsClientAuthRequired',
                  e.target.checked
                )}
              data-testid="tls-required-checkbox"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
      {formik.values.tls && formik.values.tlsClientAuthRequired && (
        <div className={cx('boxSection', styles.tslBoxSection)} style={{ marginTop: 15 }}>
          <EuiFlexGroup className={flexGroupClassName}>
            <EuiFlexItem className={flexItemClassName}>
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
            </EuiFlexItem>

            {formik.values.tls
              && formik.values.tlsClientAuthRequired
              && formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
                <EuiFlexItem className={flexItemClassName}>
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
                          validateCertName(e.target.value)
                        )}
                      data-testid="new-tsl-cert-pair-name"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
            )}
          </EuiFlexGroup>

          {formik.values.tls
            && formik.values.tlsClientAuthRequired
            && formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
              <>
                <EuiFlexGroup className={flexGroupClassName}>
                  <EuiFlexItem
                    style={{ width: '100%' }}
                    className={flexItemClassName}
                  >
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
                  </EuiFlexItem>
                </EuiFlexGroup>

                <EuiFlexGroup className={flexGroupClassName}>
                  <EuiFlexItem
                    style={{ width: '100%' }}
                    className={flexItemClassName}
                  >
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
                  </EuiFlexItem>
                </EuiFlexGroup>
              </>
          )}
        </div>
      )}
    </>
  )
}

export default TlsDetails
