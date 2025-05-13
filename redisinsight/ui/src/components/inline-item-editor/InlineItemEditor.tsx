import React, { ChangeEvent, Ref, useEffect, useRef, useState } from 'react'
import { capitalize } from 'lodash'
import cx from 'classnames'
import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiForm,
  EuiToolTip,
  EuiPopover,
  EuiText,
  keys,
} from '@elastic/eui'
import { IconSize } from '@elastic/eui/src/components/icon/icon'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { WindowEvent } from 'uiSrc/components/base/utils/WindowEvent'
import { FocusTrap } from 'uiSrc/components/base/utils/FocusTrap'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'

import styles from './styles.module.scss'

type Positions = 'top' | 'bottom' | 'left' | 'right' | 'inside'
type Design = 'default' | 'separate'

export interface Props {
  onDecline: (event?: React.MouseEvent<HTMLElement>) => void
  onApply: (value: string, event: React.MouseEvent) => void
  onChange?: (value: string) => void
  fieldName?: string
  initialValue?: string
  placeholder?: string
  controlsPosition?: Positions
  controlsDesign?: Design
  maxLength?: number
  expandable?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  disableEmpty?: boolean
  disableByValidation?: (value: string) => boolean
  children?: React.ReactElement
  validation?: (value: string) => string
  getError?: (
    value: string,
  ) => { title: string; content: string | React.ReactNode } | undefined
  declineOnUnmount?: boolean
  iconSize?: IconSize
  viewChildrenMode?: boolean
  autoComplete?: string
  controlsClassName?: string
  disabledTooltipText?: { title: string; content: string | React.ReactNode }
  preventOutsideClick?: boolean
  disableFocusTrap?: boolean
  approveByValidation?: (value: string) => boolean
  approveText?: { title: string; text: string }
  formComponentType?: 'form' | 'div'
  textFiledClassName?: string
}

const InlineItemEditor = (props: Props) => {
  const {
    initialValue = '',
    placeholder = '',
    controlsPosition = 'bottom',
    controlsDesign = 'default',
    onDecline,
    onApply,
    onChange,
    fieldName,
    maxLength,
    children,
    expandable,
    isLoading,
    isInvalid,
    disableEmpty,
    disableByValidation,
    validation,
    getError,
    declineOnUnmount = true,
    viewChildrenMode,
    iconSize,
    isDisabled,
    autoComplete = 'off',
    controlsClassName,
    disabledTooltipText,
    preventOutsideClick = false,
    disableFocusTrap = false,
    approveByValidation,
    approveText,
    formComponentType = 'form',
    textFiledClassName,
  } = props
  const containerEl: Ref<HTMLDivElement> = useRef(null)
  const [value, setValue] = useState<string>(initialValue)
  const [isError, setIsError] = useState<boolean>(false)
  const [isShowApprovePopover, setIsShowApprovePopover] = useState(false)

  const inputRef: Ref<HTMLInputElement> = useRef(null)

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        declineOnUnmount && onDecline()
      },
    [],
  )

  useEffect(() => {
    setTimeout(() => {
      inputRef?.current?.focus()
      inputRef?.current?.select()
    }, 100)
  }, [])

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    if (validation) {
      newValue = validation(newValue)
    }
    if (disableByValidation) {
      setIsError(disableByValidation(newValue))
    }

    setValue(newValue)
    onChange?.(newValue)
  }

  const handleClickOutside = (event: any) => {
    if (preventOutsideClick) return
    if (!containerEl?.current?.contains(event.target)) {
      if (!isLoading) {
        onDecline(event)
      } else {
        event.stopPropagation()
        event.preventDefault()
      }
    }
  }

  const handleOnEsc = (e: KeyboardEvent) => {
    if (e.key === keys.ESCAPE) {
      e.stopPropagation()
      onDecline()
    }
  }

  const handleApplyClick = (event: React.MouseEvent<HTMLElement>) => {
    if (approveByValidation && !approveByValidation?.(value)) {
      setIsShowApprovePopover(true)
    } else {
      handleFormSubmit(event)
    }
  }

  const handleFormSubmit = (event: React.MouseEvent<HTMLElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    if (!isDisabledApply()) {
      onApply(value, event)
    }
  }

  const isDisabledApply = (): boolean =>
    !!(isLoading || isError || isDisabled || (disableEmpty && !value.length))

  const ApplyBtn = (
    <EuiToolTip
      anchorClassName={styles.tooltip}
      position="bottom"
      display="inlineBlock"
      title={
        (isDisabled && disabledTooltipText?.title) ||
        (getError && getError?.(value)?.title)
      }
      content={
        (isDisabled && disabledTooltipText?.content) ||
        (getError && getError?.(value)?.content)
      }
      data-testid="apply-tooltip"
    >
      <EuiButtonIcon
        iconSize={iconSize ?? 'l'}
        iconType="check"
        color="primary"
        aria-label="Apply"
        className={cx(styles.btn, styles.applyBtn)}
        isDisabled={isDisabledApply()}
        onClick={handleApplyClick}
        data-testid="apply-btn"
      />
    </EuiToolTip>
  )

  return (
    <>
      {viewChildrenMode ? (
        children
      ) : (
        <OutsideClickDetector onOutsideClick={handleClickOutside}>
          <div ref={containerEl} className={styles.container}>
            <WindowEvent event="keydown" handler={handleOnEsc} />
            <FocusTrap disabled={disableFocusTrap}>
              <EuiForm
                component={formComponentType}
                className="relative"
                onSubmit={(e: unknown) =>
                  handleFormSubmit(e as React.MouseEvent<HTMLElement>)
                }
              >
                <FlexItem grow>
                  {children || (
                    <>
                      <EuiFieldText
                        name={fieldName}
                        id={fieldName}
                        className={cx(styles.field, textFiledClassName)}
                        maxLength={maxLength || undefined}
                        placeholder={placeholder}
                        value={value}
                        fullWidth={false}
                        compressed
                        onChange={handleChangeValue}
                        isLoading={isLoading}
                        isInvalid={isInvalid}
                        data-testid="inline-item-editor"
                        autoComplete={autoComplete}
                        inputRef={inputRef}
                      />
                      {expandable && (
                        <p className={styles.keyHiddenText}>{value}</p>
                      )}
                    </>
                  )}
                </FlexItem>
                <div
                  className={cx(
                    'inlineItemEditor__controls',
                    styles.controls,
                    styles[`controls${capitalize(controlsPosition)}`],
                    styles[`controls${capitalize(controlsDesign)}`],
                    controlsClassName,
                  )}
                >
                  <EuiButtonIcon
                    iconSize={iconSize ?? 'l'}
                    iconType="cross"
                    color="primary"
                    aria-label="Cancel editing"
                    className={cx(styles.btn, styles.declineBtn)}
                    onClick={onDecline}
                    isDisabled={isLoading}
                    data-testid="cancel-btn"
                  />
                  {!approveByValidation && ApplyBtn}
                  {approveByValidation && (
                    <EuiPopover
                      anchorPosition="leftCenter"
                      isOpen={isShowApprovePopover}
                      closePopover={() => setIsShowApprovePopover(false)}
                      anchorClassName={styles.popoverAnchor}
                      panelClassName={cx(styles.popoverPanel)}
                      className={styles.popoverWrapper}
                      button={ApplyBtn}
                    >
                      <div
                        className={styles.popover}
                        data-testid="approve-popover"
                      >
                        <EuiText size="m">
                          {!!approveText?.title && (
                            <h4>
                              <b>{approveText?.title}</b>
                            </h4>
                          )}
                          <EuiText
                            size="s"
                            color="subdued"
                            className={styles.approveText}
                          >
                            {approveText?.text}
                          </EuiText>
                        </EuiText>
                        <div className={styles.popoverFooter}>
                          <EuiButton
                            fill
                            color="warning"
                            aria-label="Save"
                            className={cx(styles.btn, styles.saveBtn)}
                            isDisabled={isDisabledApply()}
                            onClick={handleFormSubmit}
                            data-testid="save-btn"
                          >
                            Save
                          </EuiButton>
                        </div>
                      </div>
                    </EuiPopover>
                  )}
                </div>
              </EuiForm>
            </FocusTrap>
          </div>
        </OutsideClickDetector>
      )}
    </>
  )
}

export default InlineItemEditor
