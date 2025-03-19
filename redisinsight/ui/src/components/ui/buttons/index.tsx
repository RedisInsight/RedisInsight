import React from 'react'
import { Button } from '@redislabsdev/redis-ui-components'
import { IconType } from '@redislabsdev/redis-ui-icons'

type BaseButtonProps = React.ComponentProps<typeof Button> & {
  icon?: IconType
}
type ButtonProps = Omit<BaseButtonProps, 'variant'>

// eslint-disable-next-line react/prop-types
const BaseButton = ({ children, icon, variant, ...props }: BaseButtonProps) => (
  <Button {...props} variant={variant}>
    {icon && (
      <span
        style={{
          display: 'inline-block',
          marginRight: '5px',
        }}
      >
        <Button.Icon icon={icon} />
      </span>
    )}
    {children}
  </Button>
)

const PrimaryButton = (props: ButtonProps) => (
  <BaseButton {...props} variant="primary" />
)

const DestructiveButton = ({ children, icon, ...props }: ButtonProps) => (
  <BaseButton {...props} variant="destructive" />
)

type SecondaryButtonProps = ButtonProps & {
  filled?: boolean
  inverted?: boolean
}

const SecondaryButton = ({
  children,
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

export { PrimaryButton, SecondaryButton, DestructiveButton }
