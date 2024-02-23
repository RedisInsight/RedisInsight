import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react'
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
import { Maybe, stringToBuffer } from 'uiSrc/utils'

import { addKeyStateSelector, addStringKey } from 'uiSrc/slices/browser/keys'

import { SetStringWithExpireDto } from 'apiSrc/modules/browser/string/dto'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'
import {
  AddStringFormConfig as config
} from '../constants/fields-config'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyString = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const [value, setValue] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsFormValid(keyName.length > 0)
  }, [keyName])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: SetStringWithExpireDto = {
      keyName: stringToBuffer(keyName),
      value: stringToBuffer(value)
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addStringKey(data, onCancel))
  }

  return (
    <EuiForm component="form" onSubmit={onFormSubmit}>
      <EuiFormRow label={config.value.label} fullWidth>
        <EuiTextArea
          fullWidth
          name="value"
          id="value"
          resize="vertical"
          placeholder={config.value.placeholder}
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setValue(e.target.value)}
          disabled={loading}
          data-testid="string-value"
        />
      </EuiFormRow>
      <EuiButton type="submit" fill style={{ display: 'none' }}>
        Submit
      </EuiButton>
      <AddKeyFooter>
        <EuiPanel style={{ border: 'none' }} color="transparent" hasShadow={false} borderRadius="none">
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
                  data-testid="add-key-string-btn"
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

export default AddKeyString
