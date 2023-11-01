import React, { ChangeEvent, useState, useEffect, useContext } from 'react'
import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { toNumber } from 'lodash'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { Nullable, getDbIndex } from 'uiSrc/utils'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import RediStackDarkMin from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightMin from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'
import RediStackLightLogo from 'uiSrc/assets/img/modules/redistack/RedisStackLogoLight.svg'
import RediStackDarkLogo from 'uiSrc/assets/img/modules/redistack/RedisStackLogoDark.svg'

import styles from './styles.module.scss'

export interface Props {
  alias: string
  database?: Nullable<number>
  onOpen: () => void
  onClone: () => void
  onCloneBack: () => void
  isLoading: boolean
  onApplyChanges: (value: string, onSuccess?: () => void, onFail?: () => void) => void
  isRediStack?: boolean
  isCloneMode: boolean
}

const DatabaseAlias = (props: Props) => {
  const { alias, database, onOpen, onClone, onCloneBack, onApplyChanges, isLoading, isRediStack, isCloneMode } = props

  const { server } = useSelector(appInfoSelector)

  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(alias)

  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    setValue(alias)
  }, [alias])

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

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onClone()
  }

  const handleApplyChanges = () => {
    setIsEditing(false)
    onApplyChanges(value, () => {}, () => setValue(alias))
  }

  const handleDeclineChanges = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    setValue(alias)
    setIsEditing(false)
  }

  return (
    <>
      <EuiFlexGroup responsive={false} justifyContent="flexStart" alignItems="center" gutterSize="xs">
        {isCloneMode && (
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              onClick={onCloneBack}
              iconSize="m"
              iconType="sortLeft"
              className={styles.iconLeftArrow}
              aria-label="back"
              data-testid="back-btn"
            />
          </EuiFlexItem>
        )}
        <EuiFlexItem grow={false} style={{ overflow: isEditing ? 'inherit' : 'hidden' }}>
          <EuiFlexGroup
            responsive={false}
            justifyContent="spaceBetween"
            gutterSize="xs"
          >
            {isRediStack && (
              <EuiFlexItem grow={false}>
                <EuiToolTip
                  content={(
                    <EuiIcon
                      type={theme === Theme.Dark ? RediStackDarkLogo : RediStackLightLogo}
                      className={styles.tooltipLogo}
                      data-testid="tooltip-redis-stack-icon"
                    />
                  )}
                  position="bottom"
                >
                  <EuiIcon
                    type={theme === Theme.Dark ? RediStackDarkMin : RediStackLightMin}
                    className={styles.redistackIcon}
                    data-testid="redis-stack-icon"
                  />
                </EuiToolTip>
              </EuiFlexItem>
            )}
            <EuiFlexItem
              grow
              onClick={setEditMode}
              data-testid="edit-alias-btn"
              style={{ overflow: isEditing ? 'inherit' : 'hidden', maxWidth: '360px' }}
            >
              {!isCloneMode && (isEditing || isLoading) ? (
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
                <EuiText className={cx(styles.alias, { [styles.aliasEditing]: !isCloneMode })}>
                  <b className={styles.aliasText} data-testid="db-alias">
                    {isCloneMode && (<span>Clone {alias}</span>)}
                    {!isCloneMode && (<span className={cx(styles.aliasTextEditing)}>{alias}</span>)}
                  </b>
                  <b>
                    {getDbIndex(toNumber(database))}
                  </b>
                  {!isCloneMode && (<EuiIcon type="pencil" className={cx(styles.aliasEditIcon)} />)}
                </EuiText>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      {!isCloneMode && (
        <EuiFlexGroup responsive={false} gutterSize="m" style={{ marginTop: 6 }}>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              color="secondary"
              iconType="kqlFunction"
              aria-label="Connect to database"
              data-testid="connect-to-db-btn"
              className={styles.btnOpen}
              onClick={handleOpen}
            >
              Open
            </EuiButton>
          </EuiFlexItem>
          {server?.buildType !== BuildType.RedisStack && (
            <EuiFlexItem grow={false}>
              <EuiButton
                size="s"
                color="secondary"
                iconType="copy"
                aria-label="Clone database"
                data-testid="clone-db-btn"
                className={styles.btnClone}
                onClick={handleClone}
              >
                Clone
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      )}
    </>
  )
}

export default DatabaseAlias
