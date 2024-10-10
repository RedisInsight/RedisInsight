import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiButton,
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiPanel,
  EuiSuperSelect,
  EuiSuperSelectOption,
} from '@elastic/eui'

import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { insertListElementsAction } from 'uiSrc/slices/browser/list'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { AddListFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { PushElementToListDto } from 'apiSrc/modules/browser/list/dto'

import styles from '../styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

export enum ListElementDestination {
  Tail = 'TAIL',
  Head = 'HEAD',
}

export const TAIL_DESTINATION: ListElementDestination = ListElementDestination.Tail
export const HEAD_DESTINATION: ListElementDestination = ListElementDestination.Head

export const optionsDestinations: EuiSuperSelectOption<string>[] = [
  {
    value: TAIL_DESTINATION,
    inputDisplay: 'Push to tail',
  },
  {
    value: HEAD_DESTINATION,
    inputDisplay: 'Push to head',
  },
]

const AddListElements = (props: Props) => {
  const { closePanel } = props

  const [elements, setElements] = useState<string[]>([''])
  const [destination, setDestination] = useState<ListElementDestination>(TAIL_DESTINATION)
  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) ?? { name: undefined }
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const elementInput = useRef<HTMLInputElement>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    // ComponentDidMount
    elementInput.current?.focus()
  }, [])

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
        keyType: KeyTypes.List,
        numberOfAdded: elements.length,
      }
    })
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

  const isClearDisabled = (item:string) => elements.length === 1 && !item.length

  const handleElementChange = (value: string, index: number) => {
    const newElements = [...elements]
    newElements[index] = value
    setElements(newElements)
  }

  const submitData = (): void => {
    const data: PushElementToListDto = {
      keyName: selectedKey,
      elements: elements.map((el) => stringToBuffer(el)),
      destination,
    }
    dispatch(insertListElementsAction(data, onSuccessAdded))
  }

  return (
    <>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        data-test-subj="add-list-field-panel"
        className={cx(styles.container, 'eui-yScroll', 'flexItemNoFullWidth', 'inlineFieldsNoSpace')}
      >
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleElementChange(e.target.value, index)}
              data-testid={`element-${index}`}
            />
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
                onClick={submitData}
                data-testid="save-elements-btn"
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

export default AddListElements
