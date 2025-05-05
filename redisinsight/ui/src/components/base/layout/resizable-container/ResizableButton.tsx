import React, {
  FunctionComponent,
  ButtonHTMLAttributes,
  MouseEvent,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { EuiI18n } from '@elastic/eui/src/components/i18n/i18n'
import { useEuiResizableContainerContext } from '@elastic/eui/src/components/resizable_container/context'
import { StyledResizableButton } from './euiResizableButton.scss'

import { htmlIdGenerator } from '../../services'
import {
  EuiResizableButtonController,
  EuiResizableButtonMouseEvent,
  EuiResizableButtonKeyDownEvent,
} from './types'

interface ResizableButtonControls {
  onKeyDown: (eve: EuiResizableButtonKeyDownEvent) => void
  onMouseDown: (eve: EuiResizableButtonMouseEvent) => void
  onTouchStart: (eve: EuiResizableButtonMouseEvent) => void
  onFocus: (id: string) => void
  onBlur: () => void
  registration: {
    register: (resizer: EuiResizableButtonController) => void
    deregister: (resizerId: EuiResizableButtonController['id']) => void
  }
  isHorizontal: boolean
}

export interface EuiResizableButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof ResizableButtonControls
  >,
  Partial<ResizableButtonControls> { }

const generatePanelId = htmlIdGenerator('resizable-button')

export const EuiResizableButton: FunctionComponent<EuiResizableButtonProps> = ({
  isHorizontal,
  id,
  registration,
  disabled,
  onFocus,
  onBlur,
  ...rest
}) => {
  const resizerId = useRef(id || generatePanelId())
  const { registry: { resizers } = { resizers: {} } } =
    useEuiResizableContainerContext()
  const isDisabled = useMemo(
    () =>
      disabled ||
      (resizers[resizerId.current] && resizers[resizerId.current].isDisabled),
    [resizers, disabled],
  )

  const previousRef = useRef<HTMLElement>()
  const onRef = useCallback(
    (ref: HTMLElement | null) => {
      if (!registration) return
      const id = resizerId.current
      if (ref) {
        previousRef.current = ref
        registration.register({
          id,
          ref,
          isFocused: false,
          isDisabled: disabled || false,
        })
      } else if (previousRef.current != null) {
        registration.deregister(id)
        previousRef.current = undefined
      }
    },
    [registration, disabled],
  )

  const setFocus = (e: MouseEvent<HTMLButtonElement>) => e.currentTarget.focus()

  const handleFocus = () => {
    onFocus && onFocus(resizerId.current)
  }

  return (
    <EuiI18n
      tokens={[
        'euiResizableButton.horizontalResizerAriaLabel',
        'euiResizableButton.verticalResizerAriaLabel',
      ]}
      defaults={[
        'Press left or right to adjust panels size',
        'Press up or down to adjust panels size',
      ]}
    >
      {([horizontalResizerAriaLabel, verticalResizerAriaLabel]: string[]) => (
        <StyledResizableButton
          id={resizerId.current}
          ref={onRef}
          aria-label={
            isHorizontal ? horizontalResizerAriaLabel : verticalResizerAriaLabel
          }
          data-test-subj="euiResizableButton"
          type="button"
          isHorizontal={isHorizontal}
          isDisabled={isDisabled}
          onClick={setFocus}
          onFocus={handleFocus}
          onBlur={onBlur}
          disabled={isDisabled}
          {...rest}
        />
      )}
    </EuiI18n>
  )
}
