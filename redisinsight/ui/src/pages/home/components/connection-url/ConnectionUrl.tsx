import React, { useState } from 'react'
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiSpacer,
  EuiTextArea,
  EuiToolTip
} from '@elastic/eui'
import { useFormik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { Nullable, parseRedisUrl } from 'uiSrc/utils'

import { AddDbType } from 'uiSrc/pages/home/constants'
import { Instance } from 'uiSrc/slices/interfaces'
import {
  createInstanceStandaloneAction,
  instancesSelector,
  testInstanceStandaloneAction
} from 'uiSrc/slices/instances/instances'
import { Pages } from 'uiSrc/constants'
import ConnectivityOptions from './components/connectivity-options'

import styles from './styles.module.scss'

export interface Props {
  onSelectOption: (type: AddDbType, db: Nullable<Record<string, any>>) => void
  onClose?: () => void
}

const getPayload = (connectionUrl: string, returnOnError = false) => {
  const details = parseRedisUrl(connectionUrl.trim())

  if (!details && returnOnError) return null

  return {
    name: details?.hostname || '127.0.0.1:6379',
    host: details?.host || '127.0.0.1',
    port: details?.port || 6379,
    username: details?.username || 'default',
    password: details?.password || undefined,
    tls: details?.protocol === 'rediss',
    db: details?.dbNumber,
  }
}

const ConnectionUrlError = (
  <>
    The connection URL format provided is not supported.
    <br />
    Try adding a database using a connection form.
  </>
)

const ConnectionUrl = (props: Props) => {
  const { onSelectOption, onClose } = props
  const [isInvalid, setIsInvalid] = useState<Boolean>(false)
  const { loadingChanging: isLoading } = useSelector(instancesSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  const validate = (values: any) => {
    const payload = getPayload(values.connectionURL, true)
    setIsInvalid(!payload && values.connectionURL)
  }

  const handleTestConnection = () => {
    const payload = getPayload(formik.values.connectionURL)
    dispatch(testInstanceStandaloneAction(payload as Instance))
  }

  const handleProceedForm = (type: AddDbType) => {
    const details = getPayload(formik.values.connectionURL)
    onSelectOption(type, details)
  }

  const onSubmit = () => {
    if (isInvalid) return

    const payload = getPayload(formik.values.connectionURL)
    dispatch(createInstanceStandaloneAction(payload as Instance, () => {
      history.push(Pages.sentinelDatabases)
    }))
  }

  const formik = useFormik({
    initialValues: {
      connectionURL: 'redis://default@127.0.0.1:6379'
    },
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit
  })

  return (
    <div>
      <EuiForm
        component="form"
        onSubmit={formik.handleSubmit}
        data-testid="form"
      >
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow label={(
              <div className={styles.connectionUrlInfo}>
                <div>Connection URL</div>
                <EuiToolTip
                  title="The following connection URLs are supported:"
                  className="homePage_tooltip"
                  position="right"
                  content={(
                    <ul className="homePage_toolTipUl">
                      <li><span className="dot" />redis://[[username]:[password]]@host:port</li>
                      <li><span className="dot" />rediss://[[username]:[password]]@host:port</li>
                      <li><span className="dot" />host:port</li>
                    </ul>
                  )}
                >
                  <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
                </EuiToolTip>
              </div>
            )}
            >
              <EuiTextArea
                name="connectionURL"
                id="connectionURL"
                value={formik.values.connectionURL}
                onChange={formik.handleChange}
                fullWidth
                placeholder="redis://default@127.0.0.1:6379"
                resize="none"
                style={{ height: 88 }}
                data-testid="connection-url"
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiToolTip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              content={
                isInvalid ? (<span className="euiToolTip__content">{ConnectionUrlError}</span>) : null
              }
            >
              <EuiButtonEmpty
                size="s"
                className="empty-btn"
                isDisabled={!!isInvalid}
                iconType={isInvalid ? 'iInCircle' : undefined}
                onClick={handleTestConnection}
                isLoading={isLoading}
                data-testid="btn-test-connection"
              >
                Test Connection
              </EuiButtonEmpty>
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  color="secondary"
                  onClick={() => handleProceedForm(AddDbType.manual)}
                  data-testid="btn-connection-settings"
                >
                  Connection Settings
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiToolTip
                  position="top"
                  anchorClassName="euiToolTip__btn-disabled"
                  content={
                    isInvalid ? (<span className="euiToolTip__content">{ConnectionUrlError}</span>) : null
                  }
                >
                  <EuiButton
                    fill
                    size="s"
                    color="secondary"
                    type="submit"
                    isDisabled={!!isInvalid}
                    iconType={isInvalid ? 'iInCircle' : undefined}
                    data-testid="btn-submit"
                  >
                    Add Database
                  </EuiButton>
                </EuiToolTip>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
      <EuiSpacer />
      <div className={styles.hr}>Or</div>
      <EuiSpacer />
      <ConnectivityOptions onClickOption={handleProceedForm} onClose={onClose} />
    </div>
  )
}

export default ConnectionUrl
