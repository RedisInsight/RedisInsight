import React, { ChangeEvent } from 'react'
import { useSelector } from 'react-redux'
import { FormikProps } from 'formik'

import { EuiFieldText, EuiIcon, EuiToolTip } from '@elastic/eui'
import { BuildType } from 'uiSrc/constants/env'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import {
  handlePasteHostName,
  MAX_PORT_NUMBER,
  MAX_TIMEOUT_NUMBER,
  selectOnFocus,
  validateField,
} from 'uiSrc/utils'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { NumericInput, PasswordInput } from 'uiSrc/components/base/inputs'

interface IShowFields {
  alias: boolean
  host: boolean
  port: boolean
  timeout: boolean
}

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  onHostNamePaste: (content: string) => boolean
  showFields: IShowFields
  autoFocus?: boolean
  readyOnlyFields?: string[]
}

const DatabaseForm = (props: Props) => {
  const {
    formik,
    onHostNamePaste,
    autoFocus = false,
    showFields,
    readyOnlyFields = [],
  } = props

  const { server } = useSelector(appInfoSelector)

  const AppendHostName = () => (
    <EuiToolTip
      title={
        <div>
          <p>
            <b>Pasting a connection URL auto fills the database details.</b>
          </p>
          <p style={{ margin: 0, paddingTop: '10px' }}>
            The following connection URLs are supported:
          </p>
        </div>
      }
      className="homePage_tooltip"
      anchorClassName="inputAppendIcon"
      position="right"
      content={
        <ul className="homePage_toolTipUl">
          <li>
            <span className="dot" />
            redis://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            rediss://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            host:port
          </li>
        </ul>
      }
    >
      <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
    </EuiToolTip>
  )

  const isShowPort =
    server?.buildType !== BuildType.RedisStack && showFields.port
  const isFieldDisabled = (name: string) => readyOnlyFields.includes(name)

  return (
    <>
      {showFields.alias && (
        <Row gap="m">
          <FlexItem grow>
            <FormField label="Database Alias*">
              <EuiFieldText
                fullWidth
                name="name"
                id="name"
                data-testid="name"
                placeholder="Enter Database Alias"
                onFocus={selectOnFocus}
                value={formik.values.name ?? ''}
                maxLength={500}
                onChange={formik.handleChange}
                disabled={isFieldDisabled('alias')}
              />
            </FormField>
          </FlexItem>
        </Row>
      )}

      {(showFields.host || isShowPort) && (
        <Row gap="m">
          {showFields.host && (
            <FlexItem grow={4}>
              <FormField label="Host*">
                <EuiFieldText
                  autoFocus={autoFocus}
                  name="ip"
                  id="host"
                  data-testid="host"
                  color="secondary"
                  maxLength={200}
                  placeholder="Enter Hostname / IP address / Connection URL"
                  value={formik.values.host ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldValue(
                      'host',
                      validateField(e.target.value.trim()),
                    )
                  }}
                  onPaste={(event: React.ClipboardEvent<HTMLInputElement>) =>
                    handlePasteHostName(onHostNamePaste, event)
                  }
                  onFocus={selectOnFocus}
                  append={<AppendHostName />}
                  disabled={isFieldDisabled('host')}
                />
              </FormField>
            </FlexItem>
          )}
          {isShowPort && (
            <FlexItem grow={2}>
              <FormField
                label="Port*"
                additionalText={`Should not exceed ${MAX_PORT_NUMBER}.`}
              >
                <NumericInput
                  autoValidate
                  name="port"
                  id="port"
                  data-testid="port"
                  placeholder="Enter Port"
                  onChange={(value) => formik.setFieldValue('port', value)}
                  value={Number(formik.values.port)}
                  min={0}
                  max={MAX_PORT_NUMBER}
                  onFocus={selectOnFocus}
                  disabled={isFieldDisabled('port')}
                />
              </FormField>
            </FlexItem>
          )}
        </Row>
      )}

      <Row gap="m">
        <FlexItem grow>
          <FormField label="Username">
            <EuiFieldText
              name="username"
              id="username"
              data-testid="username"
              fullWidth
              maxLength={200}
              placeholder="Enter Username"
              value={formik.values.username ?? ''}
              onChange={formik.handleChange}
              disabled={isFieldDisabled('username')}
            />
          </FormField>
        </FlexItem>

        <FlexItem grow>
          <FormField label="Password">
            <PasswordInput
              name="password"
              id="password"
              data-testid="password"
              maxLength={10_000}
              placeholder="Enter Password"
              value={
                formik.values.password === true
                  ? SECURITY_FIELD
                  : (formik.values.password ?? '')
              }
              onChangeCapture={formik.handleChange}
              onFocus={() => {
                if (formik.values.password === true) {
                  formik.setFieldValue('password', '')
                }
              }}
              autoComplete="new-password"
              disabled={isFieldDisabled('password')}
            />
          </FormField>
        </FlexItem>
      </Row>

      {showFields.timeout && (
        <Row gap="m" responsive>
          <FlexItem grow>
            <FormField label="Timeout (s)">
              <NumericInput
                autoValidate
                name="timeout"
                id="timeout"
                data-testid="timeout"
                placeholder="Enter Timeout (in seconds)"
                onChange={(value) => formik.setFieldValue('timeout', value)}
                value={Number(formik.values.timeout)}
                min={1}
                max={MAX_TIMEOUT_NUMBER}
                onFocus={selectOnFocus}
                disabled={isFieldDisabled('timeout')}
              />
            </FormField>
          </FlexItem>
          <FlexItem grow />
        </Row>
      )}
    </>
  )
}

export default DatabaseForm
