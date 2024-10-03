import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiPanel,
  EuiTextColor
} from '@elastic/eui'

import { CreateListWithExpireDto } from 'apiSrc/modules/browser/list/dto'
import { addKeyStateSelector, addListKey } from 'uiSrc/slices/browser/keys'
import { Maybe, stringToBuffer } from 'uiSrc/utils'

import AddMultipleFields from '../../add-multiple-fields'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'
import {
  AddListFormConfig as config,
} from '../constants/fields-config'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyList = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const [elements, setElements] = useState<string[]>([''])

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
  const addField = () => {
    setElements([...elements, ''])
  }
  const onClickRemove = (_item: string, index?: number) => {
    setElements(elements.filter((_el, i) => i !== index))
  }

  const isClearDisabled = (_element:string, index?: number) => index === 0

  const handleElementChange = (value: string, index: number) => {
    const newElements = [...elements]
    newElements[index] = value
    setElements(newElements)
  }

  const submitData = (): void => {
    const data: CreateListWithExpireDto = {
      keyName: stringToBuffer(keyName),
      elements: elements.map((el) => stringToBuffer(el)),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addListKey(data, onCancel))
  }

  return (
    <EuiForm component="form" onSubmit={onFormSubmit}>
      <AddMultipleFields
        items={elements}
        onClickRemove={onClickRemove}
        onClickAdd={addField}
        isClearDisabled={isClearDisabled}
      >
        {(item, index) => (
          <EuiFieldText
            fullWidth
            name={`element-${index}`}
            id={`element-${index}`}
            placeholder={config.element.placeholder}
            value={item}
            disabled={loading}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleElementChange(e.target.value, index)}
            data-testid={`element-${index}`}
          />
        )}
      </AddMultipleFields>
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
                onClick={() => onCancel(true)}
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
