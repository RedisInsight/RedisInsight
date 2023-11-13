import React from 'react'
import {
  EuiButton,
  EuiButtonIcon,
  EuiToolTip,
} from '@elastic/eui'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import {
  KEY_TYPES_ACTIONS,
  KeyTypes,
  ModulesKeyTypes,
  STREAM_ADD_ACTION,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_DISABLED_STRING_EDITING,
} from 'uiSrc/constants'
import { initialKeyInfo, selectedKeyDataSelector, selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { streamSelector } from 'uiSrc/slices/browser/stream'
import {
  Maybe,
  isFormatEditable,
  isFullStringLoaded,
} from 'uiSrc/utils'
import { stringDataSelector, stringSelector } from 'uiSrc/slices/browser/string'

import { MIDDLE_SCREEN_RESOLUTION } from '../../constants'
import styles from './styles.module.scss'

export interface Props {
  keyType: KeyTypes | ModulesKeyTypes
  width: Maybe<number>
  onAddItem?: () => void
  onEditItem?: () => void
  onRemoveItem?: () => void
}

const KeyDetailsHeaderActions = ({
  width = 0,
  keyType,
  onAddItem = () => {},
  onEditItem = () => {},
  onRemoveItem = () => {},
}: Props) => {
  const { length } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { value: keyValue } = useSelector(stringDataSelector)
  const { isCompressed: isStringCompressed } = useSelector(stringSelector)
  const { viewType: streamViewType } = useSelector(streamSelector)
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)

  const isEditable = !isStringCompressed && isFormatEditable(viewFormatProp)
  const isStringEditable = keyType === KeyTypes.String ? isFullStringLoaded(keyValue?.data?.length, length) : true
  const noEditableText = isStringCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_DISABLED_FORMATTER_EDITING
  const editToolTip = !isEditable ? noEditableText : (!isStringEditable ? TEXT_DISABLED_STRING_EDITING : null)

  return (
    <>
      {KEY_TYPES_ACTIONS[keyType] && 'addItems' in KEY_TYPES_ACTIONS[keyType] && (
      <EuiToolTip
        content={width > MIDDLE_SCREEN_RESOLUTION ? '' : KEY_TYPES_ACTIONS[keyType].addItems?.name}
        position="left"
        anchorClassName={cx(styles.actionBtn, { [styles.iiu]: width > MIDDLE_SCREEN_RESOLUTION })}
      >
        <>
          {width > MIDDLE_SCREEN_RESOLUTION ? (
            <EuiButton
              size="s"
              iconType="plusInCircle"
              color="secondary"
              aria-label={KEY_TYPES_ACTIONS[keyType].addItems?.name}
              onClick={onAddItem}
              data-testid="add-key-value-items-btn"
            >
              {KEY_TYPES_ACTIONS[keyType].addItems?.name}
            </EuiButton>
          ) : (
            <EuiButtonIcon
              iconType="plusInCircle"
              color="primary"
              aria-label={KEY_TYPES_ACTIONS[keyType].addItems?.name}
              onClick={onAddItem}
              data-testid="add-key-value-items-btn"
            />
          )}
        </>
      </EuiToolTip>
      )}
      {keyType === KeyTypes.Stream && (
      <EuiToolTip
        content={width > MIDDLE_SCREEN_RESOLUTION ? '' : STREAM_ADD_ACTION[streamViewType].name}
        position="left"
        anchorClassName={cx(styles.actionBtn, { [styles.withText]: width > MIDDLE_SCREEN_RESOLUTION })}
      >
        <>
          {width > MIDDLE_SCREEN_RESOLUTION ? (
            <EuiButton
              size="s"
              iconType="plusInCircle"
              color="secondary"
              aria-label={STREAM_ADD_ACTION[streamViewType].name}
              onClick={onAddItem}
              data-testid="add-key-value-items-btn"
            >
              {STREAM_ADD_ACTION[streamViewType].name}
            </EuiButton>
          ) : (
            <EuiButtonIcon
              iconType="plusInCircle"
              color="primary"
              aria-label={STREAM_ADD_ACTION[streamViewType].name}
              onClick={onAddItem}
              data-testid="add-key-value-items-btn"
            />
          )}
        </>
      </EuiToolTip>
      )}
      {KEY_TYPES_ACTIONS[keyType] && 'removeItems' in KEY_TYPES_ACTIONS[keyType] && (
      <EuiToolTip
        content={KEY_TYPES_ACTIONS[keyType].removeItems?.name}
        position="left"
        anchorClassName={styles.actionBtn}
      >
        <EuiButtonIcon
          iconType="minusInCircle"
          color="primary"
          aria-label={KEY_TYPES_ACTIONS[keyType].removeItems?.name}
          onClick={onRemoveItem}
          data-testid="remove-key-value-items-btn"
        />
      </EuiToolTip>
      )}
      {KEY_TYPES_ACTIONS[keyType] && 'editItem' in KEY_TYPES_ACTIONS[keyType] && (
      <div className={styles.actionBtn}>
        <EuiToolTip
          content={editToolTip}
          data-testid="edit-key-value-tooltip"
        >
          <EuiButtonIcon
            disabled={!isEditable || !isStringEditable}
            iconType="pencil"
            color="primary"
            aria-label={KEY_TYPES_ACTIONS[keyType].editItem?.name}
            onClick={onEditItem}
            data-testid="edit-key-value-btn"
          />
        </EuiToolTip>
      </div>
      )}
    </>
  )
}

export { KeyDetailsHeaderActions }
