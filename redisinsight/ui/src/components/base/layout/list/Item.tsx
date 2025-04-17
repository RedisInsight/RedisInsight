import React, {
  ButtonHTMLAttributes,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react'
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
  color,
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
  // Only add the label as the title attribute if it's possibly truncated
  // Also ensure the value of the title attribute is a string
  const [ref, innerText] = useInnerText()
  const labelContent = !wrapText ? (
    <StyledLabel
      ref={ref}
      className="label"
      title={typeof label === 'string' ? label : innerText}
      wrapText={wrapText}
    >
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
        $isActive={isActive}
        $isDisabled={isDisabled}
        $isClickable={isClickable}
        $size={size}
        ref={buttonRef}
        $color={color}
        {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>)}
      >
        {iconNode !== undefined && iconNode}
        {labelContent}
      </StyledItemInnerButton>
    )
  } else {
    itemContent = (
      <StyledItemInnerSpan
        $isClickable={false}
        $isActive={isActive}
        $isDisabled={isDisabled}
        className={ListClassNames.listItemText}
        $color={color}
        $size={size}
        {...rest}
      >
        {iconNode !== undefined && iconNode}
        {labelContent}
      </StyledItemInnerSpan>
    )
  }

  return (
    <StyledItem
      $size={size}
      $isActive={isActive}
      $isDisabled={isDisabled}
      $color={color}
      onClick={onClick}
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
type RefT = HTMLElement | Element | undefined | null

/**
 * `useInnerText` is a hook that provides the text content of the DOM node referenced by `ref`.
 *
 * When `ref` changes, the hook will update the `innerText` value by reading the `ref`'s `innerText` property.
 * If `ref` is null or does not have an `innerText` property, the hook will return `null`.
 *
 * @example
 * const MyComponent = () => {
 *   const [ref, innerText] = useInnerText('default value')
 *
 *   return (
 *     <div ref={ref}>
 *       {innerText}
 *     </div>
 *   )
 * }
 *
 * @param innerTextFallback Value to return if `ref` is null or does not have an `innerText` property.
 * @returns A tuple containing a function to update the `ref` and the current `innerText` value.
 */
export function useInnerText(
  innerTextFallback?: string,
): [(node: RefT) => void, string | undefined] {
  const [ref, setRef] = useState<RefT>(null)
  const [innerText, setInnerText] = useState(innerTextFallback)

  const updateInnerText = useCallback(
    (node: RefT) => {
      if (!node) return
      setInnerText(
        // Check for `innerText` implementation rather than a simple OR check
        // because in real cases the result of `innerText` could correctly be `null`
        // while the result of `textContent` could correctly be non-`null` due to
        // differing reliance on browser layout calculations.
        // We prefer the result of `innerText`, if available.
        'innerText' in node
          ? node.innerText
          : node.textContent || innerTextFallback,
      )
    },
    [innerTextFallback],
  )

  useEffect(() => {
    const observer = new MutationObserver((mutationsList) => {
      if (mutationsList.length) updateInnerText(ref)
    })

    if (ref) {
      updateInnerText(ref)
      observer.observe(ref, {
        characterData: true,
        subtree: true,
        childList: true,
      })
    }
    return () => {
      observer.disconnect()
    }
  }, [ref, updateInnerText])

  return [setRef, innerText]
}
