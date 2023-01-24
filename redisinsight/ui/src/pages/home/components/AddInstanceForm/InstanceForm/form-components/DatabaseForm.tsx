import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import {
  EuiFieldNumber,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow, EuiIcon,
  EuiToolTip
} from '@elastic/eui'
import { handlePasteHostName, MAX_PORT_NUMBER, selectOnFocus, validateField, validatePortNumber } from 'uiSrc/utils'
import { ConnectionType, InstanceType } from 'uiSrc/slices/interfaces'
import { DbConnectionInfo } from '../interfaces'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
  isEditMode: boolean
  isCloneMode: boolean
  onHostNamePaste: (content: string) => boolean
  instanceType: InstanceType
  connectionType?: ConnectionType
}

const DatabaseForm = (props: Props) => {
  const {
    flexGroupClassName = '',
    flexItemClassName = '',
    formik,
    isEditMode,
    isCloneMode,
    onHostNamePaste,
    instanceType,
    connectionType
  } = props

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

  return (
    <>
      {(!isEditMode || isCloneMode) && (
        <EuiFlexGroup className={flexGroupClassName}>
          <EuiFlexItem className={flexItemClassName}>
            <EuiFormRow label="Host*">
              <EuiFieldText
                autoFocus={!isCloneMode && isEditMode}
                name="host"
                id="host"
                data-testid="host"
                color="secondary"
                maxLength={200}
                placeholder="Enter Hostname / IP address / Connection URL"
                value={formik.values.host ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateField(e.target.value.trim())
                  )
                }}
                onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => handlePasteHostName(onHostNamePaste, event)}
                onFocus={selectOnFocus}
                append={<AppendHostName />}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem className={flexItemClassName}>
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
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}

      {(
        (!isEditMode || isCloneMode)
        && instanceType !== InstanceType.Sentinel
        && connectionType !== ConnectionType.Sentinel
      ) && (
        <EuiFlexGroup className={flexGroupClassName}>
          <EuiFlexItem className={flexItemClassName}>
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
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}

      <EuiFlexGroup className={flexGroupClassName}>
        <EuiFlexItem className={flexItemClassName}>
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
            />
          </EuiFormRow>
        </EuiFlexItem>

        <EuiFlexItem className={flexItemClassName}>
          <EuiFormRow label="Password">
            <EuiFieldPassword
              type="dual"
              name="password"
              id="password"
              data-testid="password"
              fullWidth
              className="passwordField"
              maxLength={10_000}
              placeholder="Enter Password"
              value={formik.values.password ?? ''}
              onChange={formik.handleChange}
              dualToggleProps={{ color: 'text' }}
              autoComplete="new-password"
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}

export default DatabaseForm
