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
  EuiSuperSelect,
  EuiSuperSelectOption,
} from '@elastic/eui'

import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { insertListElementsAction } from 'uiSrc/slices/browser/list'
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

const optionsDestinations: EuiSuperSelectOption<string>[] = [
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

  const [element, setElement] = useState<string>('')
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
        numberOfAdded: 1,
      }
    })
  }

  const submitData = (): void => {
    const data: PushElementToListDto = {
      keyName: selectedKey,
      element: stringToBuffer(element),
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
        className={cx(styles.content, 'eui-yScroll', 'flexItemNoFullWidth', 'inlineFieldsNoSpace')}
      >
        <EuiFlexItem grow>
          <EuiFlexGroup gutterSize="none" alignItems="center">
            <EuiFlexItem grow={false} style={{ minWidth: '220px' }}>
              <EuiFormRow fullWidth>
                <EuiSuperSelect
                  valueOfSelected={destination}
                  options={optionsDestinations}
                  onChange={(value) => setDestination(value as ListElementDestination)}
                  data-testid="destination-select"
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow>
              <EuiFormRow fullWidth>
                <EuiFieldText
                  fullWidth
                  name={config.element.name}
                  id={config.element.name}
                  placeholder={config.element.placeholder}
                  value={element}
                  autoComplete="off"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setElement(e.target.value)}
                  data-testid="elements-input"
                  inputRef={elementInput}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
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
