import React, { FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Maybe, stringToBuffer } from 'uiSrc/utils'

import { addKeyStateSelector, addStringKey } from 'uiSrc/slices/browser/keys'

import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextArea } from 'uiSrc/components/base/inputs'
import { SetStringWithExpireDto } from 'apiSrc/modules/browser/string/dto'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'
import { AddStringFormConfig as config } from '../constants/fields-config'

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
      value: stringToBuffer(value),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addStringKey(data, onCancel))
  }

  return (
    <form onSubmit={onFormSubmit}>
      <FormField label={config.value.label}>
        <TextArea
          name="value"
          id="value"
          placeholder={config.value.placeholder}
          value={value}
          onChange={setValue}
          disabled={loading}
          data-testid="string-value"
        />
      </FormField>
      <PrimaryButton type="submit" style={{ display: 'none' }}>
        Submit
      </PrimaryButton>
      <AddKeyFooter>
        <>
          <Row justify="end" gap="m" style={{ padding: 18 }}>
            <FlexItem>
              <div>
                <SecondaryButton
                  onClick={() => onCancel(true)}
                  className="btn-cancel btn-back"
                >
                  Cancel
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
                  data-testid="add-key-string-btn"
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

export default AddKeyString
