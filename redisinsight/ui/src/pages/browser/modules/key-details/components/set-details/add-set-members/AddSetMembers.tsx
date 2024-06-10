import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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

import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { addSetMembersAction, setSelector } from 'uiSrc/slices/browser/set'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { KeyTypes } from 'uiSrc/constants'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { stringToBuffer } from 'uiSrc/utils'
import { AddZsetFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { INITIAL_SET_MEMBER_STATE, ISetMemberState } from 'uiSrc/pages/browser/components/add-key/AddKeySet/interfaces'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'

import styles from './styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

const AddSetMembers = (props: Props) => {
  const { closePanel } = props
  const dispatch = useDispatch()
  const [members, setMembers] = useState<ISetMemberState[]>([{ ...INITIAL_SET_MEMBER_STATE }])
  const { loading } = useSelector(setSelector)
  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) ?? { name: undefined }
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const lastAddedMemberName = useRef<HTMLInputElement>(null)

  useEffect(() => {
    lastAddedMemberName.current?.focus()
  }, [members.length])

  const onSuccessAdded = () => {
    closePanel()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_ADDED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Set,
        numberOfAdded: members.length,
      }
    })
  }

  const addMember = () => {
    const lastField = members[members.length - 1]
    const newState = [
      ...members,
      {
        ...INITIAL_SET_MEMBER_STATE,
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
      }
      : item))
    setMembers(newState)
  }

  const onClickRemove = ({ id }: ISetMemberState) => {
    if (members.length === 1) {
      clearMemberValues(id)
      return
    }

    removeMember(id)
  }

  const handleMemberChange = (formField: string, id: number, value: string) => {
    const newState = members.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: value,
        }
      }
      return item
    })
    setMembers(newState)
  }

  const submitData = (): void => {
    const data = {
      keyName: selectedKey,
      members: members.map((item) => stringToBuffer(item.name)),
    }

    dispatch(addSetMembersAction(data, onSuccessAdded))
  }

  const isClearDisabled = (item: ISetMemberState): boolean => members.length === 1 && !item.name.length

  return (
    <>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        data-test-subj="add-set-field-panel"
        className={cx(styles.container, 'eui-yScroll', 'flexItemNoFullWidth')}
      >
        <AddMultipleFields
          items={members}
          isClearDisabled={isClearDisabled}
          onClickRemove={onClickRemove}
          onClickAdd={addMember}
        >
          {(item, index) => (
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
            </EuiFlexGroup>
          )}
        </AddMultipleFields>
      </EuiPanel>
      <EuiPanel
        style={{ border: 'none' }}
        color="transparent"
        hasShadow={false}
        className="flexItemNoFullWidth"
      >
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="l">
          <EuiFlexItem grow={false}>
            <EuiButton color="secondary" onClick={() => closePanel(true)} data-testid="cancel-members-btn">
              <EuiTextColor color="default">Cancel</EuiTextColor>
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="m"
              color="secondary"
              disabled={loading}
              isLoading={loading}
              onClick={submitData}
              data-testid="save-members-btn"
            >
              Save
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  )
}

export { AddSetMembers }
