import React, { ChangeEvent } from 'react'
import {
  EuiCheckbox,
  EuiFieldNumber,
  EuiFieldPassword,
  EuiFieldText,
  EuiFormRow,
  EuiRadioGroup,
  EuiRadioGroupOption,
  EuiTextArea,
  htmlIdGenerator,
} from '@elastic/eui'
import cx from 'classnames'
import { FormikProps } from 'formik'

import {
  MAX_PORT_NUMBER,
  selectOnFocus,
  validateField,
  validatePortNumber,
} from 'uiSrc/utils'
import { SECURITY_FIELD } from 'uiSrc/constants'

import { SshPassType } from 'uiSrc/pages/home/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import styles from '../styles.module.scss'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
}

const sshPassTypeOptions: EuiRadioGroupOption[] = [
  {
    id: SshPassType.Password,
    label: 'Password',
    'data-test-subj': 'radio-btn-password',
  },
  {
    id: SshPassType.PrivateKey,
    label: 'Private Key',
    'data-test-subj': 'radio-btn-privateKey',
  },
]

const SSHDetails = (props: Props) => {
  const { flexGroupClassName = '', flexItemClassName = '', formik } = props

  return (
    <>
      <Row
        gap="m"
        className={cx(flexGroupClassName, {
          [styles.tlsContainer]: !flexGroupClassName,
          [styles.tlsSniOpened]: !!formik.values.ssh,
        })}
        align={!flexGroupClassName ? 'end' : undefined}
      >
        <FlexItem style={{ width: '230px' }} className={flexItemClassName}>
          <EuiCheckbox
            id={`${htmlIdGenerator()()} ssh`}
            name="ssh"
            label="Use SSH Tunnel"
            checked={!!formik.values.ssh}
            onChange={formik.handleChange}
            data-testid="use-ssh"
          />
        </FlexItem>
      </Row>

      {formik.values.ssh && (
        <>
          <Row gap="m" responsive className={flexGroupClassName}>
            <FlexItem grow className={cx(flexItemClassName)}>
              <EuiFormRow label="Host*">
                <EuiFieldText
                  name="sshHost"
                  id="sshHost"
                  data-testid="sshHost"
                  color="secondary"
                  maxLength={200}
                  placeholder="Enter SSH Host"
                  value={formik.values.sshHost ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldValue(
                      e.target.name,
                      validateField(e.target.value.trim()),
                    )
                  }}
                />
              </EuiFormRow>
            </FlexItem>

            <FlexItem grow className={flexItemClassName}>
              <EuiFormRow label="Port*" helpText="Should not exceed 65535.">
                <EuiFieldNumber
                  name="sshPort"
                  id="sshPort"
                  data-testid="sshPort"
                  style={{ width: '100%' }}
                  placeholder="Enter SSH Port"
                  value={formik.values.sshPort ?? ''}
                  maxLength={6}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldValue(
                      e.target.name,
                      validatePortNumber(e.target.value.trim()),
                    )
                  }}
                  onFocus={selectOnFocus}
                  type="text"
                  min={0}
                  max={MAX_PORT_NUMBER}
                />
              </EuiFormRow>
            </FlexItem>
          </Row>

          <Row gap="m" responsive className={flexGroupClassName}>
            <FlexItem grow className={cx(flexItemClassName)}>
              <EuiFormRow label="Username*">
                <EuiFieldText
                  name="sshUsername"
                  id="sshUsername"
                  data-testid="sshUsername"
                  color="secondary"
                  maxLength={200}
                  placeholder="Enter SSH Username"
                  value={formik.values.sshUsername ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldValue(
                      e.target.name,
                      validateField(e.target.value.trim()),
                    )
                  }}
                />
              </EuiFormRow>
            </FlexItem>
          </Row>

          <Spacer />
          <Row gap="m" responsive className={flexGroupClassName}>
            <FlexItem
              grow
              className={cx(flexItemClassName, styles.sshPassTypeWrapper)}
              >
              <EuiRadioGroup
                id="sshPassType"
                name="sshPassType"
                options={sshPassTypeOptions}
                idSelected={formik.values.sshPassType}
                className={styles.sshPassType}
                onChange={(id) => formik.setFieldValue('sshPassType', id)}
                data-testid="ssh-pass-type"
              />
            </FlexItem>
          </Row>

          {formik.values.sshPassType === SshPassType.Password && (
            <Row gap="m" responsive className={flexGroupClassName}>
              <FlexItem grow className={flexItemClassName}>
                <EuiFormRow label="Password">
                  <EuiFieldPassword
                    type="password"
                    name="sshPassword"
                    id="sshPassword"
                    data-testid="sshPassword"
                    fullWidth
                    className="passwordField"
                    maxLength={10_000}
                    placeholder="Enter SSH Password"
                    value={
                      formik.values.sshPassword === true
                        ? SECURITY_FIELD
                        : (formik.values.sshPassword ?? '')
                    }
                    onChange={formik.handleChange}
                    onFocus={() => {
                      if (formik.values.sshPassword === true) {
                        formik.setFieldValue('sshPassword', '')
                      }
                    }}
                    autoComplete="new-password"
                  />
                </EuiFormRow>
              </FlexItem>
            </Row>
          )}

          {formik.values.sshPassType === SshPassType.PrivateKey && (
            <>
              <Row gap="m" responsive className={flexGroupClassName}>
                <FlexItem grow className={flexItemClassName}>
                  <EuiFormRow label="Private Key*">
                    <EuiTextArea
                      name="sshPrivateKey"
                      id="sshPrivateKey"
                      data-testid="sshPrivateKey"
                      fullWidth
                      className="passwordField"
                      maxLength={50_000}
                      placeholder="Enter SSH Private Key in PEM format"
                      value={
                        formik.values.sshPrivateKey === true
                          ? SECURITY_FIELD
                          : (formik?.values?.sshPrivateKey?.replace(
                              /./g,
                              '•',
                            ) ?? '')
                      }
                      onChange={formik.handleChange}
                      onFocus={() => {
                        if (formik.values.sshPrivateKey === true) {
                          formik.setFieldValue('sshPrivateKey', '')
                        }
                      }}
                    />
                  </EuiFormRow>
                </FlexItem>
              </Row>
              <Row gap="m" responsive className={flexGroupClassName}>
                <FlexItem grow className={flexItemClassName}>
                  <EuiFormRow label="Passphrase">
                    <EuiFieldPassword
                      type="password"
                      name="sshPassphrase"
                      id="sshPassphrase"
                      data-testid="sshPassphrase"
                      fullWidth
                      className="passwordField"
                      maxLength={50_000}
                      placeholder="Enter Passphrase for Private Key"
                      value={
                        formik.values.sshPassphrase === true
                          ? SECURITY_FIELD
                          : (formik.values.sshPassphrase ?? '')
                      }
                      onChange={formik.handleChange}
                      onFocus={() => {
                        if (formik.values.sshPassphrase === true) {
                          formik.setFieldValue('sshPassphrase', '')
                        }
                      }}
                      autoComplete="new-password"
                    />
                  </EuiFormRow>
                </FlexItem>
              </Row>
            </>
          )}
        </>
      )}
    </>
  )
}

export default SSHDetails
