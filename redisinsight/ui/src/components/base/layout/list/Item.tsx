import React, { ButtonHTMLAttributes, ReactElement } from 'react'
// todo replace with redis-ui icon
import { EuiIcon } from '@elastic/eui'
import cx from 'classnames'
import {
  ListClassNames,
  ListGroupItemProps,
  StyledItem,
  StyledItemInnerButton,
  StyledItemInnerSpan,
  StyledLabel,
} from 'uiSrc/components/base/layout/list/list.styles'

const Item = ({
  size,
  label,
  isActive,
  isDisabled,
  className,
  children,
  onClick,
  iconType,
  iconProps,
  icon,
  wrapText,
  buttonRef,
  ...rest
}: ListGroupItemProps) => {
  const isClickable = !!onClick
  let iconNode: ReactElement

  if (iconType) {
    // todo replace with redis-ui icon
    iconNode = (
      <EuiIcon
        color="inherit" // forces the icon to inherit its parent color
        {...iconProps}
        type={iconType}
        className={cx('euiListGroupItem__icon', iconProps?.className)}
        style={{
          ...iconProps?.style,
          marginRight: 'var(--size-m)',
          flexGrow: 0,
          flexShrink: 0,
        }}
      />
    )

    if (icon) {
      console.warn(
        'Both `iconType` and `icon` were passed to EuiListGroupItem but only one can exist. The `iconType` was used.',
      )
    }
  } else if (icon) {
    iconNode = icon
  } else {
    iconNode = <></>
  }
  const labelContent = !wrapText ? (
    <StyledLabel className="label" title={label} wrapText={wrapText}>
      {label}
    </StyledLabel>
  ) : (
    <StyledLabel className="label" wrapText={wrapText}>
      {label}
    </StyledLabel>
  )
  let itemContent: ReactElement
  if (isDisabled || onClick) {
    itemContent = (
      <StyledItemInnerButton
        type="button"
        className={ListClassNames.listItemButton}
        disabled={isDisabled}
        onClick={onClick}
        isActive={isActive}
        isDisabled={isDisabled}
        isClickable={isClickable}
        size={size}
        ref={buttonRef}
        {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>)}
      >
        {iconNode !== undefined && iconNode}
        {labelContent}
      </StyledItemInnerButton>
    )
  } else {
    itemContent = (
      <StyledItemInnerSpan
        isClickable={false}
        isActive={isActive}
        isDisabled={isDisabled}
        className={ListClassNames.listItemText}
        {...rest}
      >
        {iconNode !== undefined && iconNode}
        {labelContent}
      </StyledItemInnerSpan>
    )
  }

  return (
    <StyledItem
      size={size}
      isActive={isActive}
      isDisabled={isDisabled}
      onClick={onClick}
      color={rest.color}
      className={cx(ListClassNames.listItem, className, {
        [ListClassNames.listItemActive]: isActive,
        [ListClassNames.listItemDisabled]: isDisabled,
      })}
    >
      {itemContent}
    </StyledItem>
  )
}

export default Item
