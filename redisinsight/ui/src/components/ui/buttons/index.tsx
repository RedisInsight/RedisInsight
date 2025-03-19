import React from 'react'
import { Button } from '@redislabsdev/redis-ui-components'
import { IconType } from '@redislabsdev/redis-ui-icons'
import styled from 'styled-components'
import { LoaderLargeIcon } from '@redislabsdev/redis-ui-icons/multicolor'

type BaseButtonProps = React.ComponentProps<typeof Button> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
}
type ButtonProps = Omit<BaseButtonProps, 'variant'>

const IconContainer = styled.span<{
  left?: boolean
  right?: boolean
  children: React.ReactNode
}>`
  display: inline-block;
  margin-right: ${(props) => (props.left ? '5px' : '0')};
  margin-left: ${(props) => (props.right ? '5px' : '0')};
`
const IconSizes = {
  small: '16px',
  medium: '20px',
  large: '24px',
}

const renderIcon = (
  side: 'left' | 'right',
  props: Pick<BaseButtonProps, 'icon' | 'iconSide' | 'loading' | 'size'>,
) => {
  const { icon, iconSide, loading, size = 'medium' } = props
  if (iconSide !== side) {
    return null
  }
  let renderIcon = icon
  if (loading) {
    renderIcon = LoaderLargeIcon
  }
  if (!renderIcon) {
    return null
  }
  return (
    <IconContainer left={side === 'left'} right={side === 'right'}>
      <Button.Icon icon={renderIcon} customSize={IconSizes[size] || '16px'} />
    </IconContainer>
  )
}
// eslint-disable-next-line react/prop-types
const BaseButton = ({
  children,
  icon,
  iconSide = 'left',
  loading,
  ...props
}: BaseButtonProps) => (
  <Button {...props} disabled={props.disabled || loading}>
    {renderIcon('left', { icon, iconSide, loading, size: props.size })}
    {children}
    {renderIcon('right', { icon, iconSide, loading, size: props.size })}
  </Button>
)

const PrimaryButton = (props: ButtonProps) => (
  <BaseButton {...props} variant="primary" />
)

const DestructiveButton = (props: ButtonProps) => (
  <BaseButton {...props} variant="destructive" />
)

type SecondaryButtonProps = ButtonProps & {
  filled?: boolean
  inverted?: boolean
}

const SecondaryButton = ({
  filled,
  inverted,
  ...props
}: SecondaryButtonProps) => {
  let variant: BaseButtonProps['variant'] = 'secondary-fill'

  if (filled === false) {
    variant = 'secondary-ghost'
  }
  if (inverted === true) {
    variant = 'secondary-invert'
  }
  return <BaseButton {...props} variant={variant} />
}

const OutlineButton = (
  props: Omit<SecondaryButtonProps, 'filled' | 'inverted'>,
) => <SecondaryButton {...props} filled={false} />

export { PrimaryButton, SecondaryButton, DestructiveButton, OutlineButton }
