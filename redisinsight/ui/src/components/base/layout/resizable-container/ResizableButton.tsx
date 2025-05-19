import React, {
  ButtonHTMLAttributes,
  forwardRef,
  MouseEvent,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { EuiI18n, htmlIdGenerator } from '@elastic/eui'

import { ResizableButtonController, ResizableButtonMouseEvent } from './types'
import { useResizableContainerContext } from './context'
import { StyledResizableButton } from './resizable-button.styles'

interface ResizableButtonControls {
  onKeyDown: (eve: ResizableButtonMouseEvent) => void
  onMouseDown: (eve: ResizableButtonMouseEvent) => void
  onTouchStart: (eve: ResizableButtonMouseEvent) => void
  onFocus: (id: string) => void
  onBlur: () => void
  registration: {
    register: (resizer: ResizableButtonController) => void
    deregister: (resizerId: ResizableButtonController['id']) => void
  }
  isHorizontal: boolean
}

export interface ResizableButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof ResizableButtonControls
  >,
  Partial<ResizableButtonControls> {
  ref?: React.Ref<HTMLButtonElement>
}

const generatePanelId = htmlIdGenerator('resizable-button')

export const ResizableButton = forwardRef<HTMLButtonElement, ResizableButtonProps>(
  (
    { isHorizontal, id, registration, disabled, onFocus, onBlur, ...rest },
    ref,
  ) => {
    const resizerId = useRef(id || generatePanelId())
    const context = useResizableContainerContext()
    const resizers = context?.registry?.resizers || {}
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

    const setFocus = (e: MouseEvent<HTMLButtonElement>) =>
      e.currentTarget.focus()

    const handleFocus = () => {
      onFocus && onFocus(resizerId.current)
    }

    return (
      <EuiI18n
        tokens={[
          'resizableButton.horizontalResizerAriaLabel',
          'resizableButton.verticalResizerAriaLabel',
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
              isHorizontal
                ? horizontalResizerAriaLabel
                : verticalResizerAriaLabel
            }
            data-test-subj="resizableButton"
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
  },
)
