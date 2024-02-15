import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { toNumber } from 'lodash'
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
  EuiText,
  EuiPopover,
  EuiSpacer,
  EuiIcon,
} from '@elastic/eui'

import { KeyTypes } from 'uiSrc/constants'
import { validateCountNumber, isVersionHigherOrEquals, formatNameShort, bufferToString } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import HelpTexts from 'uiSrc/constants/help-texts'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'

import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { deleteListElementsAction } from 'uiSrc/slices/browser/list'
import { connectedInstanceOverviewSelector, connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { AddListFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { DeleteListElementsDto } from 'apiSrc/modules/browser/list/dto'

import {
  TAIL_DESTINATION,
  HEAD_DESTINATION,
  ListElementDestination,
} from '../add-list-elements/AddListElements'

import styles from './styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
  onRemoveKey: () => void
}

const optionsDestinations: EuiSuperSelectOption<string>[] = [
  {
    value: TAIL_DESTINATION,
    inputDisplay: 'Remove from tail',
  },
  {
    value: HEAD_DESTINATION,
    inputDisplay: 'Remove from head',
  },
]

const RemoveListElements = (props: Props) => {
  const { closePanel, onRemoveKey } = props

  const [count, setCount] = useState<string>('')
  const [destination, setDestination] = useState<ListElementDestination>(TAIL_DESTINATION)
  const [isFormValid, setIsFormValid] = useState<boolean>(true)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState<boolean>(false)
  const [canRemoveMultiple, setCanRemoveMultiple] = useState<boolean>(true)
  const { name: selectedKey = '', length } = useSelector(selectedKeyDataSelector) ?? {
    name: undefined,
    length: 0,
  }
  const { version: databaseVersion = '' } = useSelector(connectedInstanceOverviewSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const countInput = useRef<HTMLInputElement>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    // ComponentDidMount
    countInput.current?.focus()
  }, [])

  useEffect(() => {
    setIsFormValid(toNumber(count) > 0)
  }, [count])

  useEffect(() => {
    if (
      !isVersionHigherOrEquals(
        databaseVersion,
        CommandsVersions.REMOVE_MULTIPLE_LIST_ELEMENTS.since
      )
    ) {
      setCount('1')
      setCanRemoveMultiple(false)
    }
  }, [databaseVersion])

  const handleCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCount(validateCountNumber(e.target.value))
  }

  const showPopover = () => {
    setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.List
      }
    })
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const onSuccessRemoved = (newTotal: number) => {
    if (newTotal <= 0) onRemoveKey()
    closePanel()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.List,
        numberOfRemoved: toNumber(count),
      }
    })
  }

  const submitData = (): void => {
    const data: DeleteListElementsDto = {
      keyName: selectedKey,
      count: toNumber(count),
      destination,
    }
    closePopover()
    dispatch(deleteListElementsAction(data, onSuccessRemoved))
  }

  const RemoveButton = () => (
    <EuiPopover
      anchorPosition="upCenter"
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelClassName={styles.panelCancelBtn}
      panelPaddingSize="l"
      button={(
        <EuiButton
          fill
          size="m"
          color="secondary"
          onClick={showPopover}
          disabled={!isFormValid}
          data-testid="remove-elements-btn"
        >
          Remove
        </EuiButton>
      )}
    >
      <div className={styles.popover}>
        <EuiText size="m">
          <h4 style={{ marginTop: 0 }}>
            <b>{count}</b>
            {' '}
            Element(s)
          </h4>
          <EuiText size="s">
            will be removed from the
            {' '}
            {destination.toLowerCase()}
            {' '}
            of
            {' '}
            <b>{formatNameShort(bufferToString(selectedKey))}</b>
          </EuiText>
          {(!length || length <= +count) && (
            <div className={styles.appendInfo}>
              <EuiIcon type="alert" style={{ marginRight: '1rem', marginTop: '4px' }} />
              <EuiText size="s">If you remove all Elements, the whole Key will be deleted.</EuiText>
            </div>
          )}
        </EuiText>
        <EuiSpacer />
        <EuiButton
          fill
          size="s"
          color="warning"
          onClick={submitData}
          iconType="trash"
          className={styles.popoverDeleteBtn}
          data-testid="remove-submit"
        >
          Remove
        </EuiButton>
      </div>
    </EuiPopover>
  )

  const InfoBoxPopover = () => (
    <EuiPopover
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip')}
      anchorPosition="leftCenter"
      isOpen={isInfoPopoverOpen}
      closePopover={() => setIsInfoPopoverOpen(false)}
      initialFocus={false}
      button={(
        <EuiIcon
          className={styles.infoIcon}
          type="iInCircle"
          onClick={() => setIsInfoPopoverOpen((isPopoverOpen) => !isPopoverOpen)}
          style={{ cursor: 'pointer' }}
          data-testid="info-tooltip-icon"
        />
      )}
    >
      <div className={styles.popover}>{HelpTexts.REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT}</div>
    </EuiPopover>
  )

  return (
    <>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        className={cx(styles.content, 'eui-yScroll', 'flexItemNoFullWidth', 'inlineFieldsNoSpace')}
      >
        <EuiFlexItem grow>
          <EuiFlexGroup gutterSize="none" alignItems="center">
            <EuiFlexItem grow={false} style={{ minWidth: '220px' }}>
              <EuiFormRow fullWidth>
                <EuiSuperSelect
                  className={styles.select}
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
                  name={config.count.name}
                  id={config.count.name}
                  maxLength={200}
                  placeholder={config.count.placeholder}
                  value={count}
                  data-testid="count-input"
                  autoComplete="off"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleCountChange(e)}
                  inputRef={countInput}
                  disabled={!canRemoveMultiple}
                  append={!canRemoveMultiple ? InfoBoxPopover() : <></>}
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
              <EuiButton color="secondary" onClick={() => closePanel(true)} data-testid="cancel-elements-btn">
                <EuiTextColor color="default">Cancel</EuiTextColor>
              </EuiButton>
            </div>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <div>
              {RemoveButton()}
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  )
}

export { RemoveListElements }
