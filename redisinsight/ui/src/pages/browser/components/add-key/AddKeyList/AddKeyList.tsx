import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiForm, EuiSuperSelect, EuiFieldText } from '@elastic/eui'

import { Maybe, stringToBuffer } from 'uiSrc/utils'
import { addKeyStateSelector, addListKey } from 'uiSrc/slices/browser/keys'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  optionsDestinations,
  TAIL_DESTINATION,
} from 'uiSrc/pages/browser/modules/key-details/components/list-details/add-list-elements/AddListElements'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import {
  CreateListWithExpireDto,
  ListElementDestination,
} from 'apiSrc/modules/browser/list/dto'

import { AddListFormConfig as config } from '../constants/fields-config'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'
import AddMultipleFields from '../../add-multiple-fields'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyList = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const [elements, setElements] = useState<string[]>([''])
  const [destination, setDestination] =
    useState<ListElementDestination>(TAIL_DESTINATION)

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
    if (elements.length === 1) {
      setElements([''])
    } else {
      setElements(elements.filter((_el, i) => i !== index))
    }
  }

  const isClearDisabled = (item: string) =>
    elements.length === 1 && !item.length

  const handleElementChange = (value: string, index: number) => {
    const newElements = [...elements]
    newElements[index] = value
    setElements(newElements)
  }

  const submitData = (): void => {
    const data: CreateListWithExpireDto = {
      destination,
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
      <EuiSuperSelect
        valueOfSelected={destination}
        options={optionsDestinations}
        onChange={(value) => setDestination(value as ListElementDestination)}
        data-testid="destination-select"
      />
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
              handleElementChange(e.target.value, index)
            }
            data-testid={`element-${index}`}
          />
        )}
      </AddMultipleFields>
      <PrimaryButton type="submit" style={{ display: 'none' }}>
        Submit
      </PrimaryButton>
      <AddKeyFooter>
        <>
          <Row justify="end" style={{ padding: 18 }}>
            <FlexItem>
              <SecondaryButton
                onClick={() => onCancel(true)}
                className="btn-cancel btn-back"
              >
                Cancel
              </SecondaryButton>
            </FlexItem>
            <FlexItem>
              <PrimaryButton
                className="btn-add"
                loading={loading}
                onClick={submitData}
                disabled={!isFormValid || loading}
                data-testid="add-key-list-btn"
              >
                Add Key
              </PrimaryButton>
            </FlexItem>
          </Row>
        </>
      </AddKeyFooter>
    </EuiForm>
  )
}

export default AddKeyList
