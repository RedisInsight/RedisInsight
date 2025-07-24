import React, { FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { Maybe, stringToBuffer } from 'uiSrc/utils'
import { addKeyStateSelector, addReJSONKey } from 'uiSrc/slices/browser/keys'

import { MonacoJson } from 'uiSrc/components/monaco-editor'
import UploadFile from 'uiSrc/components/upload-file'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText } from 'uiSrc/components/base/text'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { CreateRejsonRlWithExpireDto } from 'apiSrc/modules/browser/rejson-rl/dto'

import { AddJSONFormConfig as config } from '../constants/fields-config'

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
      data: ReJSONValue,
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
      },
    })
  }

  return (
    <form onSubmit={onFormSubmit}>
      <FormField label={config.value.label}>
        <>
          <MonacoJson
            value={ReJSONValue}
            onChange={setReJSONValue}
            disabled={loading}
            data-testid="json-value"
          />
          <Row justify="end">
            <FlexItem>
              <UploadFile
                onClick={onClick}
                onFileChange={setReJSONValue}
                accept="application/json, text/plain"
              />
            </FlexItem>
          </Row>
        </>
      </FormField>

      <PrimaryButton type="submit" style={{ display: 'none' }}>
        Submit
      </PrimaryButton>
      <AddKeyFooter>
        <>
          <Row justify="end" style={{ padding: 18 }}>
            <FlexItem>
              <div>
                <SecondaryButton
                  onClick={() => onCancel(true)}
                  className="btn-cancel btn-back"
                >
                  <ColorText>Cancel</ColorText>
                </SecondaryButton>
              </div>
            </FlexItem>
            <FlexItem>
              <div>
                <PrimaryButton
                  className="btn-add"
                  loading={loading}
                  onClick={submitData}
                  disabled={!isFormValid || loading}
                  data-testid="add-key-json-btn"
                >
                  Add Key
                </PrimaryButton>
              </div>
            </FlexItem>
          </Row>
        </>
      </AddKeyFooter>
    </form>
  )
}

export default AddKeyReJSON
