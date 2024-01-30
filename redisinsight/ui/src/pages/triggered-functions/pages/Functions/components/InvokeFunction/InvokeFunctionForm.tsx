import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiFormRow } from '@elastic/eui'
import { map } from 'lodash'
import AddItemsActions from 'uiSrc/pages/browser/components/add-items-actions/AddItemsActions'

import styles from './styles.module.scss'

export interface Props {
  name: string
  libName: string
  onChangeKeys: (items: string[]) => void
  onChangeArgs: (items: string[]) => void
}

const initialFieldValue = [{ id: 0, value: '' }]

const InvokeFunctionForm = (props: Props) => {
  const { name, libName, onChangeArgs, onChangeKeys } = props

  const [keyNames, setKeyNames] = useState(initialFieldValue)
  const [args, setArgs] = useState(initialFieldValue)

  const isInitialLoad = useRef<boolean>(true)
  const lastAddedKeyName = useRef<HTMLInputElement>(null)
  const lastAddedArgument = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setKeyNames(initialFieldValue)
    setArgs(initialFieldValue)
  }, [libName, name])

  useEffect(() => lastAddedKeyName.current?.focus(), [keyNames.length])
  useEffect(() => {
    if (!isInitialLoad.current) {
      lastAddedArgument.current?.focus()
    }
    isInitialLoad.current = false
  }, [args.length])

  useEffect(() => onChangeKeys(map(keyNames, 'value').filter((name) => name)), [keyNames])
  useEffect(() => onChangeArgs(map(args, 'value')), [args])

  const handleAddKeyName = () => {
    const lastField = keyNames[keyNames.length - 1]
    setKeyNames((prev) => ([...prev, { id: lastField.id + 1, value: '' }]))
  }

  const handleKeyNameChange = (id: number, value: string) =>
    setKeyNames((items) => items.map((item) => {
      if (item.id === id) return { ...item, value }
      return item
    }))

  const handleRemoveKeyName = (id: number) =>
    setKeyNames((items) => items.filter((item) => item.id !== id))

  const handleAddArgument = () => {
    const lastField = args[args.length - 1]
    setArgs((prev) => ([...prev, { id: lastField.id + 1, value: '' }]))
  }

  const handleArgumentChange = (id: number, value: string) =>
    setArgs((items) => items.map((item) => {
      if (item.id === id) return { ...item, value }
      return item
    }))

  const handleRemoveArgument = (id: number) =>
    setArgs((items) => items.filter((item) => item.id !== id))

  return (
    <>
      <EuiFormRow label="Key Name" fullWidth>
        <EuiFlexItem grow>
          {keyNames.map(({ id, value }, index) => (
            <EuiFlexItem style={{ marginBottom: '8px' }} grow key={`keyName-${id}`}>
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem grow>
                  <EuiFormRow fullWidth>
                    <EuiFieldText
                      fullWidth
                      name={`keyName-${id}`}
                      id={`keyName-${id}`}
                      placeholder="Enter Key Name"
                      value={value}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleKeyNameChange(id, e.target.value)}
                      inputRef={index === keyNames.length - 1 ? lastAddedKeyName : null}
                      data-testid={`keyname-field-${id}`}
                      autoComplete="off"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <AddItemsActions
                  id={id}
                  index={index}
                  length={keyNames.length}
                  addItem={handleAddKeyName}
                  removeItem={handleRemoveKeyName}
                  loading={false}
                  clearIsDisabled={keyNames.length === 1}
                  anchorClassName={styles.refreshKeyTooltip}
                  data-testid="add-new-key-item"
                />
              </EuiFlexGroup>
            </EuiFlexItem>
          ))}
        </EuiFlexItem>
      </EuiFormRow>
      <EuiFormRow label="Argument" fullWidth>
        <EuiFlexItem grow>
          {args.map(({ id, value }, index) => (
            <EuiFlexItem style={{ marginBottom: '8px' }} grow key={`argument-${id}`}>
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem grow>
                  <EuiFormRow fullWidth>
                    <EuiFieldText
                      fullWidth
                      name={`argument-${id}`}
                      id={`argument-${id}`}
                      placeholder="Enter Argument"
                      value={value}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleArgumentChange(id, e.target.value)}
                      inputRef={index === args.length - 1 ? lastAddedArgument : null}
                      data-testid={`argument-field-${id}`}
                      autoComplete="off"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <AddItemsActions
                  id={id}
                  index={index}
                  length={args.length}
                  addItem={handleAddArgument}
                  removeItem={handleRemoveArgument}
                  loading={false}
                  clearIsDisabled={args.length === 1}
                  anchorClassName={styles.refreshKeyTooltip}
                  data-testid="add-new-argument-item"
                />
              </EuiFlexGroup>
            </EuiFlexItem>
          ))}
        </EuiFlexItem>
      </EuiFormRow>
    </>
  )
}

export default InvokeFunctionForm
