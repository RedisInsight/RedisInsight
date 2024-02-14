import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'
import cx from 'classnames'
import {
  EuiButton,
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiPanel,
} from '@elastic/eui'

import { stringToBuffer, validateScoreNumber } from 'uiSrc/utils'
import { isNaNConvertedString } from 'uiSrc/utils/numbers'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import {
  fetchAddZSetMembers,
  resetUpdateScore,
  updateZsetScoreStateSelector,
} from 'uiSrc/slices/browser/zset'

import { AddZsetFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import AddItemsActions from 'uiSrc/pages/browser/components/add-items-actions/AddItemsActions'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

export interface IZsetMemberState {
  name: string
  score: string
  id: number
}

export const INITIAL_ZSET_MEMBER_STATE: IZsetMemberState = {
  name: '',
  score: '',
  id: 0,
}

const AddZsetMembers = (props: Props) => {
  const { closePanel } = props
  const dispatch = useDispatch()
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [members, setMembers] = useState<IZsetMemberState[]>([{ ...INITIAL_ZSET_MEMBER_STATE }])
  const { loading } = useSelector(updateZsetScoreStateSelector)
  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) ?? { name: undefined }
  const lastAddedMemberName = useRef<HTMLInputElement>(null)

  useEffect(() =>
    // componentWillUnmount
    () => {
      dispatch(resetUpdateScore())
    },
  [])

  useEffect(() => {
    members.every((member) => {
      if (!member.score?.toString().length) {
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
  }, [members])

  useEffect(() => {
    lastAddedMemberName.current?.focus()
  }, [members.length])

  const addMember = () => {
    const lastField = members[members.length - 1]
    const newState = [
      ...members,
      {
        ...INITIAL_ZSET_MEMBER_STATE,
        id: lastField.id + 1,
      },
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
        score: '',
      }
      : item))
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
          score: '',
        }
      }
      if (score.length) {
        return {
          ...currentItem,
          score: toNumber(score).toString(),
        }
      }
      return currentItem
    })
    setMembers(newState)
  }

  const handleMemberChange = (formField: string, id: number, value: any) => {
    let validatedValue = value
    if (formField === 'score') {
      validatedValue = validateScore(value)
    }

    const newState = members.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: validatedValue,
        }
      }
      return item
    })
    setMembers(newState)
  }

  const submitData = (): void => {
    const data = {
      keyName: selectedKey,
      members: members.map((item) => ({
        name: stringToBuffer(item.name),
        score: toNumber(item.score),
      })),
    }
    dispatch(fetchAddZSetMembers(data, closePanel))
  }

  const isClearDisabled = (item: IZsetMemberState): boolean =>
    members.length === 1 && !(item.name.length || item.score.length)

  return (
    <>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        data-test-subj="add-zset-field-panel"
        className={cx('eui-yScroll', 'flexItemNoFullWidth', 'inlineFieldsNoSpace')}
      >
        {members.map((item, index) => (
          <EuiFlexItem style={{ marginBottom: '8px' }} grow key={item.id}>
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
                          handleMemberChange('name', item.id, e.target.value)}
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
                          handleMemberChange('score', item.id, e.target.value)}
                        onBlur={() => {
                          handleScoreBlur(item)
                        }}
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
                addItemIsDisabled={members.some((item) => !item.score.length)}
                clearItemValues={clearMemberValues}
                loading={loading}
              />
            </EuiFlexGroup>
          </EuiFlexItem>
        ))}
      </EuiPanel>
      <EuiPanel
        style={{ border: 'none' }}
        color="transparent"
        hasShadow={false}
        className="flexItemNoFullWidth"
      >
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="l">
          <EuiFlexItem grow={false}>
            <div>
              <EuiButton color="secondary" onClick={() => closePanel(true)} data-testid="cancel-members-btn">
                <EuiTextColor color="default">Cancel</EuiTextColor>
              </EuiButton>
            </div>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <div>
              <EuiButton
                fill
                size="m"
                color="secondary"
                disabled={loading || !isFormValid}
                isLoading={loading}
                onClick={submitData}
                data-testid="save-members-btn"
              >
                Save
              </EuiButton>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  )
}

export default AddZsetMembers
