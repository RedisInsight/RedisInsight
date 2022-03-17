import React, { ChangeEvent, useState, useEffect, useContext } from 'react'
import {
  EuiButton,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText,
} from '@elastic/eui'
import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import RediStackDarkLogo from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightLogo from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'

import styles from './styles.module.scss'

interface Props {
  alias: string
  database?: Nullable<number>
  onOpen: () => void
  isLoading: boolean
  onApplyChanges: (value: string, onSuccess?: () => void, onFail?: () => void) => void
  isRediStack?: boolean
}

const DatabaseAlias = (props: Props) => {
  const { alias, database, onOpen, onApplyChanges, isLoading, isRediStack } = props

  const [isEditing, setIsEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [value, setValue] = useState(alias)

  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    setValue(alias)
  }, [alias])

  const onMouseEnterAlias = () => {
    setIsHovering(true)
  }

  const onMouseLeaveAlias = () => {
    setIsHovering(false)
  }

  const setEditMode = () => {
    setIsEditing(true)
  }

  const onChange = ({ currentTarget: { value } }: ChangeEvent<HTMLInputElement>) => {
    isEditing && setValue(value)
  }

  const handleOpen = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
    onOpen()
  }

  const handleApplyChanges = () => {
    setIsEditing(false)
    onApplyChanges(value, () => setIsHovering(false), () => setValue(alias))
  }

  const handleDeclineChanges = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    setValue(alias)
    setIsEditing(false)

    setIsHovering(false)
  }

  return (
    <EuiFlexGroup responsive={false} justifyContent="spaceBetween" gutterSize="xs">
      {isRediStack && (
        <EuiFlexItem grow={false}>
          <EuiIcon
            type={theme === Theme.Dark ? RediStackDarkLogo : RediStackLightLogo}
            className={styles.redistackIcon}
            data-testid="redis-stack-icon"
          />
        </EuiFlexItem>
      )}
      <EuiFlexItem
        onMouseEnter={onMouseEnterAlias}
        onMouseLeave={onMouseLeaveAlias}
        onClick={setEditMode}
        grow
        data-testid="edit-alias-btn"
        style={{ overflow: isEditing || isHovering ? 'inherit' : 'hidden', maxWidth: '360px' }}
      >
        {isEditing || isHovering || isLoading ? (
          <EuiFlexGrid
            responsive
            className="relative"
            gutterSize="none"
          >
            <EuiFlexItem
              grow={1}
              component="span"
              className="fluid"
            >
              <>
                <InlineItemEditor
                  onApply={handleApplyChanges}
                  onDecline={handleDeclineChanges}
                  viewChildrenMode={!isEditing}
                  isLoading={isLoading}
                  isDisabled={!value}
                  declineOnUnmount={false}
                >
                  <EuiFieldText
                    name="alias"
                    id="alias"
                    className={cx(styles.input)}
                    placeholder="Enter Database Alias"
                    value={value}
                    fullWidth={false}
                    maxLength={500}
                    compressed
                    isLoading={isLoading}
                    onChange={onChange}
                    append={!isEditing
                      ? <EuiIcon type="pencil" color="subdued" /> : ''}
                    autoComplete="off"
                    data-testid="alias-input"
                  />
                </InlineItemEditor>
                <p className={styles.hiddenText}>{value}</p>
              </>
            </EuiFlexItem>
          </EuiFlexGrid>
        ) : (
          <EuiText
            className={styles.alias}
          >
            <b className={styles.aliasText}>
              <span>{alias}</span>
            </b>
            <b>
              {database ? `[${database}]` : ''}
            </b>
          </EuiText>
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton
          size="s"
          color="secondary"
          iconType="kqlFunction"
          aria-label="Connect to database"
          className={styles.btnOpen}
          onClick={handleOpen}
        >
          Open
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default DatabaseAlias
