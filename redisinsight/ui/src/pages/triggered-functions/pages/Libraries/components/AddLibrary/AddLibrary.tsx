import React, { useState, ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiButton,
  EuiFormRow,
  EuiTextColor,
  EuiForm,
  EuiCheckbox,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import {
  triggeredFunctionsAddLibrarySelector,
  addTriggeredFunctionsLibraryAction,
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'

import { MonacoJS, MonacoJson } from 'uiSrc/components/monaco-editor'
import UploadFile from 'uiSrc/components/upload-file'
import Divider from 'uiSrc/components/divider/Divider'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

export interface IProps {
  onClose: () => void
  onAdded: (lib: string) => void
}

const LibraryDetails = (props: IProps) => {
  const { onClose, onAdded } = props

  const { loading } = useSelector(triggeredFunctionsAddLibrarySelector)

  const [code, setCode] = useState<string>('#!js name=LibName api_version=1.0')
  const [configuration, setConfiguration] = useState<string>('')
  const [isShowConfiguration, setIsShowConfiguration] = useState<boolean>(false)

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const onSuccess = (name: string) => {
    onAdded(name)
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_LOADED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const onFail = (error: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_FAILED,
      eventData: {
        databaseId: instanceId,
        error,
      }
    })
  }

  const onSubmit = () => {
    if (code) {
      dispatch(addTriggeredFunctionsLibraryAction(
        instanceId,
        code,
        configuration,
        onSuccess,
        onFail,
      ))
    }
  }

  const handleChangeConfigurationCheckbox = (e: ChangeEvent<HTMLInputElement>): void => {
    const isChecked = e.target.checked
    if (!isChecked) {
      // Reset configuration field to initial value
      setConfiguration('')
    }
    setIsShowConfiguration(isChecked)
  }

  return (
    <div className={styles.main} data-testid="lib-add-form">
      <div className={styles.header}>
        <EuiTitle size="xs"><span>Load New library</span></EuiTitle>
        <EuiToolTip
          content="Close"
          position="left"
          anchorClassName="triggeredFunctions__closeRightPanel"
        >
          <EuiButtonIcon
            iconType="cross"
            color="primary"
            aria-label="Close panel"
            className={styles.closeBtn}
            onClick={onClose}
            data-testid="close-add-form-btn"
          />
        </EuiToolTip>
      </div>
      <div className={styles.content}>
        <EuiForm component="form">
          <EuiFormRow
            label={(
              <EuiText className={styles.label}>
                Library Code
              </EuiText>
            )}
            fullWidth
          >
            <>
              <MonacoJS
                value={code}
                onChange={setCode}
                disabled={false}
                data-testid="code-value"
              />
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <UploadFile id="upload-code-file" onFileChange={setCode} accept=".js, text/plain" />
                </EuiFlexItem>
              </EuiFlexGroup>
            </>
          </EuiFormRow>
          <EuiFormRow>
            <EuiCheckbox
              id="configuration-checkbox"
              name="showConfiguration"
              label="Add configuration file"
              checked={isShowConfiguration}
              onChange={handleChangeConfigurationCheckbox}
              data-testid="show-configuration"
            />
          </EuiFormRow>
          {isShowConfiguration && (
            <>
              <Divider colorVariable="euiColorLightShade" className={styles.divider} />
              <EuiFormRow
                label={(
                  <EuiText className={styles.label}>
                    Library Configuration
                  </EuiText>
              )}
                className={styles.configurationSection}
                fullWidth
              >
                <>
                  <MonacoJson
                    value={configuration}
                    onChange={setConfiguration}
                    disabled={false}
                    data-testid="configuration-value"
                  />
                  <EuiFlexGroup justifyContent="flexEnd">
                    <EuiFlexItem grow={false}>
                      <UploadFile id="upload-configuration-file" onFileChange={setConfiguration} accept="application/json, text/plain" />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </>
              </EuiFormRow>
            </>
          )}
        </EuiForm>
      </div>
      <div className={styles.footer}>
        <EuiButton
          size="s"
          color="secondary"
          onClick={onClose}
          className={styles.cancelBtn}
        >
          <EuiTextColor>Cancel</EuiTextColor>
        </EuiButton>
        <EuiToolTip
          position="top"
          anchorClassName="euiToolTip__btn-disabled"
          title={code ? null : 'Library code is required.'}
        >
          <EuiButton
            fill
            color="secondary"
            onClick={onSubmit}
            disabled={!code || loading}
            size="s"
            isLoading={loading}
            iconType={code ? undefined : 'iInCircle'}
            data-testid="add-library-btn-submit"
          >
            Add Library
          </EuiButton>
        </EuiToolTip>
      </div>
    </div>
  )
}

export default LibraryDetails
