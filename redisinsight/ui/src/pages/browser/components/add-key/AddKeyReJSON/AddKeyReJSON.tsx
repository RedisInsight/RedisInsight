import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiButton,
  EuiFormRow,
  EuiTextColor,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel, EuiTextArea,
} from '@elastic/eui'
import { Maybe } from 'uiSrc/utils'
import { addKeyStateSelector, addReJSONKey, } from 'uiSrc/slices/keys'

import { CreateRejsonRlWithExpireDto } from 'apiSrc/modules/browser/dto'

import {
  AddCommonFieldsFormConfig as defaultConfig,
  AddJSONFormConfig as config
} from '../constants/fields-config'

import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'
import AddKeyCommonFields from '../AddKeyCommonFields/AddKeyCommonFields'

export interface Props {
  onCancel: (isCancelled?: boolean) => void;
}

const AddKeyReJSON = (props: Props) => {
  const { loading } = useSelector(addKeyStateSelector)
  const [keyName, setKeyName] = useState<string>('')
  const [keyTTL, setKeyTTL] = useState<Maybe<number>>(undefined)
  const [ReJSONValue, setReJSONValue] = useState<string>('')

  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

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
      keyName,
      data: ReJSONValue
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addReJSONKey(data, props.onCancel))
  }

  return (
    <EuiForm component="form" onSubmit={onFormSubmit}>
      <AddKeyCommonFields
        config={defaultConfig}
        loading={loading}
        keyName={keyName}
        setKeyName={setKeyName}
        keyTTL={keyTTL}
        setKeyTTL={setKeyTTL}
      />

      <EuiFormRow label={config.value.label} fullWidth>
        <EuiTextArea
          fullWidth
          name="value"
          id="value"
          resize="vertical"
          placeholder={config.value.placeholder}
          value={ReJSONValue}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setReJSONValue(e.target.value)}
          disabled={loading}
          data-testid="json-value"
        />
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
                  color="success"
                  onClick={() => props.onCancel(true)}
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
                  color="success"
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
