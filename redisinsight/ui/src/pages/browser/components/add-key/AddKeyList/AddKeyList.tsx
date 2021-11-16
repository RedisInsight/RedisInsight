import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  EuiButton,
  EuiFormRow,
  EuiTextColor,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiFieldText,
} from '@elastic/eui'

import { Maybe } from 'uiSrc/utils'
import { addKeyStateSelector, addListKey } from 'uiSrc/slices/keys'
import { CreateListWithExpireDto } from 'apiSrc/modules/browser/dto'

import {
  AddListFormConfig as config,
  AddCommonFieldsFormConfig as defaultConfig,
} from '../constants/fields-config'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'
import AddKeyCommonFields from '../AddKeyCommonFields/AddKeyCommonFields'

export interface Props {
  onCancel: (isCancelled?: boolean) => void;
}

const AddKeyList = (props: Props) => {
  const [keyName, setKeyName] = useState<string>('')
  const [keyTTL, setKeyTTL] = useState<Maybe<number>>(undefined)
  const [element, setElement] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const { loading } = useSelector(addKeyStateSelector)

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
    const data: CreateListWithExpireDto = {
      keyName,
      element,
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addListKey(data, props.onCancel))
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
      <EuiFormRow label={config.element.label} fullWidth>
        <EuiFieldText
          fullWidth
          name="element"
          id="element"
          placeholder={config.element.placeholder}
          value={element}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setElement(e.target.value)}
          disabled={loading}
          data-testid="element"
        />
      </EuiFormRow>
      <EuiButton type="submit" fill style={{ display: 'none' }}>
        Submit
      </EuiButton>
      <AddKeyFooter>
        <EuiPanel
          style={{ border: 'none' }}
          color="transparent"
          hasShadow={false}
          borderRadius="none"
        >
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton
                color="secondary"
                onClick={() => props.onCancel(true)}
                className="btn-cancel btn-back"
              >
                <EuiTextColor>Cancel</EuiTextColor>
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                size="m"
                color="secondary"
                className="btn-add"
                isLoading={loading}
                onClick={submitData}
                disabled={!isFormValid || loading}
                data-testid="add-key-list-btn"
              >
                Add Key
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </AddKeyFooter>
    </EuiForm>
  )
}

export default AddKeyList
