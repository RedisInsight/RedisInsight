import React, { ChangeEvent, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FormikProps } from 'formik'

import {
  EuiFieldNumber,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow, EuiIcon,
  EuiToolTip,
  EuiButton,
  EuiText,
  EuiSpacer,
  EuiButtonEmpty
} from '@elastic/eui'
import { BuildType } from 'uiSrc/constants/env'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import {
  handlePasteHostName,
  MAX_PORT_NUMBER,
  MAX_TIMEOUT_NUMBER,
  selectOnFocus,
  validateField,
  validatePortNumber,
  validateTimeoutNumber,
} from 'uiSrc/utils'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { useMicrosoftAuth } from 'uiSrc/hooks/useMicrosoftAuth'
import AzureIcon from 'uiSrc/assets/img/azure.svg?react'

import styles from './styles.module.scss'

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
  provider?: string
}

// Component to display Azure auth information
const AzureAuthInfo = ({ formik }: { formik: FormikProps<DbConnectionInfo> }) => {
  const [authStatus, signIn, signOut, retry] = useMicrosoftAuth(formik.values.id)

  useEffect(() => {
    if (authStatus.isAuthenticated && authStatus.userEmail) {
      formik.setFieldValue('microsoftAccount', authStatus.userEmail)
    }
  }, [authStatus.isAuthenticated, authStatus.userEmail])

  if (authStatus.isLoading) {
    return (
      <>
        <EuiFlexGroup alignItems="center" gutterSize="s">
          <EuiFlexItem>
            <EuiText size="s">
              <p>Checking Microsoft authentication status...</p>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
      </>
    )
  }

  if (authStatus.error) {
    return (
      <>
        <EuiFlexGroup direction="column" gutterSize="xs">
          <EuiFlexItem>
            <EuiText size="s" color="danger">
              <p>
                <EuiIcon type="alert" color="danger" /> Authentication error: {authStatus.error}
              </p>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  onClick={retry}
                  iconType="refresh"
                  data-testid="azure-retry"
                >
                  Try Again
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  onClick={signIn}
                  iconType="user"
                  data-testid="azure-sign-in"
                >
                  Sign in with Microsoft
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
      </>
    )
  }

  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            {authStatus.isAuthenticated ? (
              <>Azure account: <strong>{authStatus.userEmail || authStatus.displayName}</strong></>
            ) : (
              <>Sign in with your Microsoft account*</>
            )}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {authStatus.isAuthenticated ? (
            <EuiButtonEmpty
              size="xs"
              onClick={signOut}
              data-testid="azure-sign-out"
            >
              Sign out
            </EuiButtonEmpty>
          ) : (
            <EuiButton
              color="secondary"
              onClick={signIn}
              data-testid="azure-sign-in"
              className={styles.typeBtn}
            >
              <AzureIcon className={styles.btnIcon} />
              Azure Managed Redis
            </EuiButton>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
    </>
  )
}

const DatabaseForm = (props: Props) => {
  const {
    formik,
    onHostNamePaste,
    autoFocus = false,
    showFields,
    readyOnlyFields = [],
    provider = ''
  } = props

  const { server } = useSelector(appInfoSelector)

  const AppendHostName = () => (
    <EuiToolTip
      title={(
        <div>
          <p>
            <b>Pasting a connection URL auto fills the database details.</b>
          </p>
          <p style={{ margin: 0, paddingTop: '10px' }}>
            The following connection URLs are supported:
          </p>
        </div>
      )}
      className="homePage_tooltip"
      anchorClassName="inputAppendIcon"
      position="right"
      content={(
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
      )}
    >
      <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
    </EuiToolTip>
  )

  const isShowPort = server?.buildType !== BuildType.RedisStack && showFields.port
  const isFieldDisabled = (name: string) => readyOnlyFields.includes(name)
  const isAzureProvider = provider.includes('AZURE_CACHE')

  return (
    <>
      {isAzureProvider && <AzureAuthInfo formik={formik} />}

      {showFields.alias && (
        <EuiFlexGroup responsive={false}>
          <EuiFlexItem>
            <EuiFormRow label="Database Alias*">
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
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}

      {(showFields.host || isShowPort) && (
        <EuiFlexGroup responsive={false}>
          {showFields.host && (
            <EuiFlexItem grow={4}>
              <EuiFormRow label="Host*">
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
                      validateField(e.target.value.trim())
                    )
                  }}
                  onPaste={(event: React.ClipboardEvent<HTMLInputElement> & {
                    originalEvent: {
                      clipboardData: DataTransfer | null;
                    };
                  }) => handlePasteHostName(onHostNamePaste, event)}
                  onFocus={selectOnFocus}
                  append={<AppendHostName />}
                  disabled={isFieldDisabled('host')}
                />
              </EuiFormRow>
            </EuiFlexItem>
          )}
          {isShowPort && (
            <EuiFlexItem grow={2}>
              <EuiFormRow label="Port*" helpText="Should not exceed 65535.">
                <EuiFieldNumber
                  name="port"
                  id="port"
                  data-testid="port"
                  style={{ width: '100%' }}
                  placeholder="Enter Port"
                  value={formik.values.port ?? ''}
                  maxLength={6}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldValue(
                      e.target.name,
                      validatePortNumber(e.target.value.trim())
                    )
                  }}
                  onFocus={selectOnFocus}
                  type="text"
                  min={0}
                  max={MAX_PORT_NUMBER}
                  disabled={isFieldDisabled('port')}
                />
              </EuiFormRow>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      )}

      {!isAzureProvider && (
        <EuiFlexGroup responsive={false}>
          <EuiFlexItem grow={1}>
            <EuiFormRow label="Username">
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
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem grow={1}>
            <EuiFormRow label="Password">
              <EuiFieldPassword
                type="password"
                name="password"
                id="password"
                data-testid="password3"
                fullWidth
                className="passwordField"
                maxLength={10_000}
                placeholder="Enter Password"
                value={formik.values.password === true ? SECURITY_FIELD : formik.values.password ?? ''}
                onChange={formik.handleChange}
                onFocus={() => {
                  if (formik.values.password === true) {
                    formik.setFieldValue(
                      'password',
                      '',
                    )
                  }
                }}
                dualToggleProps={{ color: 'text' }}
                autoComplete="new-password"
                disabled={isFieldDisabled('password')}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}

      {showFields.timeout && (
        <EuiFlexGroup>
          <EuiFlexItem grow={1}>
            <EuiFormRow label="Timeout (s)">
              <EuiFieldNumber
                name="timeout"
                id="timeout"
                data-testid="timeout"
                style={{ width: '100%' }}
                placeholder="Enter Timeout (in seconds)"
                value={formik.values.timeout ?? ''}
                maxLength={7}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateTimeoutNumber(e.target.value.trim())
                  )
                }}
                onFocus={selectOnFocus}
                type="text"
                min={1}
                max={MAX_TIMEOUT_NUMBER}
                disabled={isFieldDisabled('timeout')}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={1} />
        </EuiFlexGroup>
      )}
    </>
  )
}

export default DatabaseForm
