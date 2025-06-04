import React from 'react'
import {
  Toast,
  toast,
  ToastContentParams,
  ToastOptions,
} from '@redis-ui/components'
import { EuiTextColor } from '@elastic/eui'
import styled from 'styled-components'
import { Theme } from '@redis-ui/styles'
import { CommonProps } from 'uiSrc/components/base/theme/types'
import { CancelIcon } from 'uiSrc/components/base/icons'

type RiToastProps = React.ComponentProps<typeof Toast>
export const RiToast = (props: RiToastProps) => <Toast {...props} />
const StyledMessage = styled.div<{ theme: Theme }>`
  margin-bottom: ${({ theme }) => theme.core.space.space100};
`

export const riToast = (
  {
    onClose,
    actions,
    message,
    ...content
  }: ToastContentParams &
    CommonProps & {
      onClose?: VoidFunction
    },
  options?: ToastOptions | undefined,
) => {
  const toastContent: ToastContentParams = {
    ...content,
  }

  if (typeof message === 'string') {
    // TODO: replace with ColorText
    let color = options?.variant
    if (color === 'informative') {
      // @ts-ignore
      color = 'subdued'
    }
    toastContent.message = (
      // @ts-ignore
      <EuiTextColor color={color}>
        <StyledMessage>{message}</StyledMessage>
      </EuiTextColor>
    )
  } else {
    toastContent.message = message
  }

  if (onClose) {
    toastContent.showCloseButton = false
    toastContent.actions = {
      ...actions,
      secondary: {
        label: '',
        icon: CancelIcon,
        closes: true,
        onClick: onClose,
      },
    }
  }
  if (actions && !onClose) {
    toastContent.showCloseButton = false
    toastContent.actions = actions
  }
  const toastOptions: ToastOptions = {
    ...options,
    delay: 100,
    closeOnClick: false,
  }
  return toast(toastContent, toastOptions)
}
riToast.Variant = toast.Variant
riToast.Position = toast.Position
riToast.dismiss = toast.dismiss
