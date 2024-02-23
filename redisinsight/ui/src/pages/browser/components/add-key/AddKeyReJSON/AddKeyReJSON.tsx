import React, { FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  EuiButton,
  EuiFormRow,
  EuiTextColor,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
} from '@elastic/eui'

import { Maybe, stringToBuffer } from 'uiSrc/utils'
import { addKeyStateSelector, addReJSONKey, } from 'uiSrc/slices/browser/keys'

import { MonacoJson } from 'uiSrc/components/monaco-editor'
import UploadFile from 'uiSrc/components/upload-file'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { CreateRejsonRlWithExpireDto } from 'apiSrc/modules/browser/rejson-rl/dto'

import {
  AddJSONFormConfig as config
} from '../constants/fields-config'

import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyReJSON = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const [ReJSONValue, setReJSONValue] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  useEffect(() => {
    try {
      JSON.parse(ReJSONValue)
      if (keyName.length > 0) {
        setIsFormValid(true)
        return
      }
    } catch (e) {
      setIsFormValid(false)
    }

    setIsFormValid(false)
  }, [keyName, ReJSONValue])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateRejsonRlWithExpireDto = {
      keyName: stringToBuffer(keyName),
      data: ReJSONValue
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addReJSONKey(data, onCancel))
  }

  const onClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_JSON_VALUE_IMPORT_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  return (
    <EuiForm component="form" onSubmit={onFormSubmit}>
      <EuiFormRow label={config.value.label} fullWidth>
        <>
          <MonacoJson
            value={ReJSONValue}
            onChange={setReJSONValue}
            disabled={loading}
            data-testid="json-value"
          />
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <UploadFile onClick={onClick} onFileChange={setReJSONValue} accept="application/json, text/plain" />
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      </EuiFormRow>

      <EuiButton type="submit" fill style={{ display: 'none' }}>
        Submit
      </EuiButton>
      <AddKeyFooter>
        <EuiPanel
          color="transparent"
          className="flexItemNoFullWidth"
          hasShadow={false}
          borderRadius="none"
          style={{ border: 'none' }}
        >
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <div>
                <EuiButton
                  color="secondary"
                  onClick={() => onCancel(true)}
                  className="btn-cancel btn-back"
                >
                  <EuiTextColor>Cancel</EuiTextColor>
                </EuiButton>
              </div>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <div>
                <EuiButton
                  fill
                  size="m"
                  color="secondary"
                  className="btn-add"
                  isLoading={loading}
                  onClick={submitData}
                  disabled={!isFormValid || loading}
                  data-testid="add-key-json-btn"
                >
                  Add Key
                </EuiButton>
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </AddKeyFooter>
    </EuiForm>
  )
}

export default AddKeyReJSON
