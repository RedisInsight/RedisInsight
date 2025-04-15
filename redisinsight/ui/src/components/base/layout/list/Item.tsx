import React, {
  HTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react'
// todo replace with redis-ui icon
import { IconType } from '@elastic/eui/src/components/icon/icon'
import classNames from 'classnames'
import { EuiIcon } from '@elastic/eui'

/*
            className={styles.item}
            isActive={isInstanceActive(instance.id)}
            disabled={loading}
            key={instance.id}
            label={
            onClick={() => {
      iconType={iconType}
      size={size}
      wrapText
      color="subdued"


 */
type IconProps = Omit<React.ComponentPropsWithRef<'span'>, 'type'>
export const SIZES = ['xs', 's', 'm', 'l'] as const
export type ListGroupItemSize = (typeof SIZES)[number]

export const COLORS = ['primary', 'text', 'subdued'] as const
export type ListGroupItemColor = (typeof COLORS)[number]

export type ListGroupItemProps = HTMLAttributes<HTMLLIElement> & {
  /**
   * Size of the label text
   */
  size?: ListGroupItemSize
  /**
   * By default, the item will get the color `text`.
   * You can customize the color of the item by passing a color name.
   */
  color?: ListGroupItemColor

  /**
   * Content to be displayed in the list item
   */
  label: ReactNode

  /**
   * Apply styles indicating an item is active
   */
  isActive?: boolean

  /**
   * Apply styles indicating an item is disabled
   */
  isDisabled?: boolean

  /**
   * Adds `EuiIcon` of `EuiIcon.type`
   */
  iconType?: IconType

  /**
   * Further extend the props applied to EuiIcon
   */
  iconProps?: Omit<IconProps, 'type'>

  /**
   * Custom node to pass as the icon. Cannot be used in conjunction
   * with `iconType` and `iconProps`.
   */
  icon?: ReactElement

  /**
   * Make the list item label a button.
   * While permitted, `href` and `onClick` should not be used together in most cases and may create problems.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>

  /**
   * Allow link text to wrap
   */
  wrapText?: boolean

  /**
   * Pass-through ref reference specifically for targeting
   * instances where the item content is rendered as a `button`
   */
  buttonRef?: React.Ref<HTMLButtonElement>
}

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
  ...rest
}: ListGroupItemProps) => {
  const isClickable = !!onClick
  let iconNode

  if (iconType) {
    iconNode = (
      <EuiIcon
        color="inherit" // forces the icon to inherit its parent color
        {...iconProps}
        type={iconType}
        className={classNames('euiListGroupItem__icon', iconProps?.className)}
      />
    )

    if (icon) {
      console.warn(
        'Both `iconType` and `icon` were passed to EuiListGroupItem but only one can exist. The `iconType` was used.',
      )
    }
  } else if (icon) {
    iconNode = icon
  }
  const labelContent = !wrapText ? (
    <span className="label" title={label ? label.toString() : ''}>
      {label}
    </span>
  ) : (
    <span className="label">{label}</span>
  )
  return (
    // todo
    <li {...rest}>{children}</li>
  )
}

export default Item
