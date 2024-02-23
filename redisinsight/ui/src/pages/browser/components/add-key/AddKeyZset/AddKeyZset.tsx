import React, { ChangeEvent, FormEvent, useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'
import cx from 'classnames'
import {
  EuiButton,
  EuiFieldText,
  EuiFormRow,
  EuiTextColor,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
} from '@elastic/eui'
import { Maybe, stringToBuffer, validateScoreNumber } from 'uiSrc/utils'
import { isNaNConvertedString } from 'uiSrc/utils/numbers'
import { addZsetKey, addKeyStateSelector } from 'uiSrc/slices/browser/keys'

import AddItemsActions from 'uiSrc/pages/browser/components/add-items-actions/AddItemsActions'

import { INITIAL_ZSET_MEMBER_STATE, IZsetMemberState } from 'uiSrc/pages/browser/modules/key-details/components/zset-details/add-zset-members/AddZsetMembers'
import { CreateZSetWithExpireDto } from 'apiSrc/modules/browser/z-set/dto'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'
import { AddZsetFormConfig as config } from '../constants/fields-config'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyZset = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const [members, setMembers] = useState<IZsetMemberState[]>([{ ...INITIAL_ZSET_MEMBER_STATE }])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const lastAddedMemberName = useRef<HTMLInputElement>(null)
  const prevCountMembers = useRef<number>(0)

  const dispatch = useDispatch()

  useEffect(() => {
    members.every((member) => {
      if (!(keyName.length && member.score?.toString().length)) {
        setIsFormValid(false)
        return false
      }

      if (!isNaNConvertedString(member.score)) {
        setIsFormValid(true)
        return true
      }

      setIsFormValid(false)
      return false
    })
  }, [keyName, members])

  useEffect(() => {
    if (prevCountMembers.current !== 0 && prevCountMembers.current < members.length) {
      lastAddedMemberName.current?.focus()
    }
    prevCountMembers.current = members.length
  }, [members.length])

  const addMember = () => {
    const lastMember = members[members.length - 1]
    const newState = [
      ...members,
      {
        ...INITIAL_ZSET_MEMBER_STATE,
        id: lastMember.id + 1
      }
    ]
    setMembers(newState)
  }

  const removeMember = (id: number) => {
    const newState = members.filter((item) => item.id !== id)
    setMembers(newState)
  }

  const clearMemberValues = (id: number) => {
    const newState = members.map((item) => (item.id === id
      ? {
        ...item,
        name: '',
        score: ''
      } : item))
    setMembers(newState)
  }

  const handleMemberChange = (
    formField: string,
    id: number,
    value: any
  ) => {
    let validatedValue = value
    if (formField === 'score') {
      validatedValue = validateScore(value)
    }
    const newState = members.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: validatedValue
        }
      }
      return item
    })
    setMembers(newState)
  }

  const validateScore = (value: any) => {
    const validatedValue = validateScoreNumber(value)
    return validatedValue.toString().length ? validatedValue : ''
  }

  const handleScoreBlur = (item: IZsetMemberState) => {
    const { score } = item
    const newState = members.map((currentItem) => {
      if (currentItem.id !== item.id) {
        return currentItem
      }
      if (isNaNConvertedString(score)) {
        return {
          ...currentItem,
          score: ''
        }
      }
      if (score.length) {
        return {
          ...currentItem,
          score: (toNumber(score)).toString()
        }
      }
      return currentItem
    })
    setMembers(newState)
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateZSetWithExpireDto = {
      keyName: stringToBuffer(keyName),
      members: members.map((item) => ({
        name: stringToBuffer(item.name),
        score: toNumber(item.score),
      }))
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addZsetKey(data, onCancel))
  }

  const isClearDisabled = (item: IZsetMemberState): boolean =>
    members.length === 1 && !(item.name.length || item.score.length)

  return (
    <EuiForm component="form" onSubmit={onFormSubmit}>
      {
        members.map((item, index) => (
          <EuiFlexItem
            className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}
            grow
            key={item.id}
            style={{ marginBottom: '8px', marginTop: '16px' }}
          >
            <EuiFlexGroup gutterSize="m">
              <EuiFlexItem grow>
                <EuiFlexGroup gutterSize="none" alignItems="center">
                  <EuiFlexItem grow>
                    <EuiFormRow fullWidth>
                      <EuiFieldText
                        fullWidth
                        name={`member-${item.id}`}
                        id={`member-${item.id}`}
                        placeholder={config.member.placeholder}
                        value={item.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMemberChange(
                            'name',
                            item.id,
                            e.target.value
                          )}
                        inputRef={index === members.length - 1 ? lastAddedMemberName : null}
                        disabled={loading}
                        data-testid="member-name"
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow>
                    <EuiFormRow fullWidth>
                      <EuiFieldText
                        fullWidth
                        name={`score-${item.id}`}
                        id={`score-${item.id}`}
                        maxLength={200}
                        placeholder={config.score.placeholder}
                        value={item.score}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleMemberChange(
                            'score',
                            item.id,
                            e.target.value
                          )}
                        onBlur={() => { handleScoreBlur(item) }}
                        disabled={loading}
                        data-testid="member-score"
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <AddItemsActions
                id={item.id}
                index={index}
                length={members.length}
                addItem={addMember}
                removeItem={removeMember}
                clearIsDisabled={isClearDisabled(item)}
                addItemIsDisabled={(members.some((item) => !item.score.length))}
                clearItemValues={clearMemberValues}
                loading={loading}
              />
            </EuiFlexGroup>
          </EuiFlexItem>
        ))
      }
      <EuiButton type="submit" fill style={{ display: 'none' }}>
        Submit
      </EuiButton>
      <AddKeyFooter>
        <EuiPanel
          className="flexItemNoFullWidth"
          color="transparent"
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
                  data-testid="add-key-zset-btn"
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

export default AddKeyZset
