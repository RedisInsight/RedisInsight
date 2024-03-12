import {
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexItem,
  EuiIcon,
  EuiText,
} from '@elastic/eui'
import cx from 'classnames'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { initialKeyInfo, selectedKeyDataSelector, selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {

  MAX_TTL_NUMBER,
  validateTTLNumber
} from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  onEditTTL: (key: RedisResponseBuffer, ttl: number) => void
}

const KeyDetailsHeaderTTL = ({
  onEditTTL,
}: Props) => {
  const { loading } = useSelector(selectedKeySelector)
  const {
    ttl: ttlProp,
    nameString: keyProp,
    name: keyBuffer,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo

  const [ttl, setTTL] = useState(`${ttlProp}`)
  const [ttlIsEditing, setTTLIsEditing] = useState(false)
  const [ttlIsHovering, setTTLIsHovering] = useState(false)

  useEffect(() => {
    setTTL(`${ttlProp}`)
  }, [keyProp, ttlProp, keyBuffer])

  const onMouseEnterTTL = () => {
    setTTLIsHovering(true)
  }

  const onMouseLeaveTTL = () => {
    setTTLIsHovering(false)
  }

  const onClickTTL = () => {
    setTTLIsEditing(true)
  }

  const onChangeTtl = ({ currentTarget: { value } }: ChangeEvent<HTMLInputElement>) => {
    ttlIsEditing && setTTL(validateTTLNumber(value) || '-1')
  }

  const applyEditTTL = () => {
    const ttlValue = ttl || '-1'

    setTTLIsEditing(false)
    setTTLIsHovering(false)

    if (`${ttlProp}` !== ttlValue && keyBuffer) {
      onEditTTL(keyBuffer, +ttlValue)
    }
  }

  const cancelEditTTl = (event: any) => {
    setTTL(`${ttlProp}`)
    setTTLIsEditing(false)
    setTTLIsHovering(false)

    event?.stopPropagation()
  }

  const appendTTLEditing = () =>
    (!ttlIsEditing ? <EuiIcon className={styles.iconPencil} type="pencil" color="subdued" /> : '')

  return (

    <EuiFlexItem
      onMouseEnter={onMouseEnterTTL}
      onMouseLeave={onMouseLeaveTTL}
      onClick={onClickTTL}
      grow={false}
      className={styles.flexItemTTL}
      data-testid="edit-ttl-btn"
    >
      <>
        {(ttlIsEditing || ttlIsHovering) && (
        <EuiFlexGrid
          columns={2}
          responsive={false}
          gutterSize="none"
          className={styles.ttlGridComponent}
        >
          <EuiFlexItem grow={false}>
            <EuiText
              grow
              color="subdued"
              size="s"
              className={styles.subtitleText}
            >
              TTL:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow component="span">
            <InlineItemEditor
              onApply={() => applyEditTTL()}
              onDecline={(event) => cancelEditTTl(event)}
              viewChildrenMode={!ttlIsEditing}
              isLoading={loading}
              declineOnUnmount={false}
            >
              <EuiFieldText
                name="ttl"
                id="ttl"
                className={cx(
                  styles.ttlInput,
                  ttlIsEditing && styles.editing,
                )}
                maxLength={200}
                placeholder="No limit"
                value={ttl === '-1' ? '' : ttl}
                fullWidth={false}
                compressed
                min={0}
                max={MAX_TTL_NUMBER}
                isLoading={loading}
                onChange={onChangeTtl}
                append={appendTTLEditing()}
                autoComplete="off"
                data-testid="edit-ttl-input"
              />
            </InlineItemEditor>
          </EuiFlexItem>
        </EuiFlexGrid>
        )}
        <EuiText
          grow
          color="subdued"
          size="s"
          className={cx(styles.subtitleText, { [styles.hidden]: ttlIsEditing || ttlIsHovering })}
          data-testid="key-ttl-text"
        >
          TTL:
          <span className={styles.ttlTextValue}>
            {ttl === '-1' ? 'No limit' : ttl}
          </span>
        </EuiText>
      </>
    </EuiFlexItem>
  )
}

export { KeyDetailsHeaderTTL }
