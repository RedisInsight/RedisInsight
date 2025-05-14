import classNames from 'classnames'
import React, { ReactElement, useCallback, useEffect, useRef } from 'react'
import { ResizableContainerProps } from './resizable-container.styles'
import {
  KeyMoveDirection,
  ResizableButtonKeyEvent,
  ResizableButtonMouseEvent,
  ResizableContainerState,
  ResizeTrigger,
} from './types'
import { useLatest } from './hooks'
import { ResizableContainerContextProvider } from './context'
import { getPosition, useContainerCallbacks } from './helpers'
import { useResizeObserver } from '../../utils/observer/resize_observer/resize-observer'

const initialState: ResizableContainerState = {
  isDragging: false,
  currentResizerPos: -1,
  prevPanelId: null,
  nextPanelId: null,
  containerSize: 1,
  panels: {},
  resizers: {},
}

export const ResizableContainer = ({
  onPanelWidthChange,
  children,
  direction,
  style,
  className,
  ...rest
}: ResizableContainerProps) => {
  const classes = classNames('RI-resizable-container', className)
  const isHorizontal = direction === 'horizontal'
  const onResizeEndRef = useLatest(onResizeEnd)
  const onResizeStartRef = useLatest(onResizeStart)
  const containerRef = useRef<HTMLDivElement>(null)

  const [actions, reducerState] = useContainerCallbacks({
    initialState: { ...initialState, isHorizontal },
    containerRef,
    onPanelWidthChange,
  })

  const containerSize = useResizeObserver(
    containerRef.current,
    isHorizontal ? 'width' : 'height',
  )

  const initialize = useCallback(() => {
    actions.initContainer(isHorizontal)
  }, [actions, isHorizontal])

  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      initialize()
    }
  }, [initialize, containerSize])

  const resizeContext = useRef<{
    trigger?: ResizeTrigger
    keyMoveDirection?: KeyMoveDirection
  }>({})

  const resizeEnd = useCallback(() => {
    onResizeEndRef.current?.()
    resizeContext.current = {}
  }, [onResizeEndRef])

  const resizeStart = useCallback(
    (trigger: ResizeTrigger, keyMoveDirection?: KeyMoveDirection) => {
      // If another resize starts while the previous one is still in progress
      // (e.g. user presses opposite arrow to change direction while the first
      // is still held down, or user presses an arrow while dragging with the
      // mouse), we want to signal the end of the previous resize first.
      if (resizeContext.current.trigger) {
        resizeEnd()
      }
      onResizeStartRef.current?.(trigger)
      resizeContext.current = { trigger, keyMoveDirection }
    },
    [onResizeStartRef, resizeEnd],
  )

  const onMouseDown = useCallback(
    (event: ResizableButtonMouseEvent) => {
      const { currentTarget } = event
      const prevPanel = currentTarget.previousElementSibling
      const nextPanel = currentTarget.nextElementSibling
      if (!prevPanel || !nextPanel) return
      const prevPanelId = prevPanel!.id
      const nextPanelId = nextPanel!.id
      const position = getPosition(event, isHorizontal)
      resizeStart('pointer')
      actions.dragStart({ position, prevPanelId, nextPanelId })

      // Window event listeners instead of React events are used to continue
      // detecting movement even if the user's mouse leaves the container

      const onMouseMove = (event: MouseEvent | TouchEvent) => {
        const position = getPosition(event, isHorizontal)
        actions.dragMove({ position, prevPanelId, nextPanelId })
      }

      const onMouseUp = () => {
        if (resizeContext.current.trigger === 'pointer') {
          resizeEnd()
        }
        actions.reset()

        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('touchmove', onMouseMove)
        window.removeEventListener('touchend', onMouseUp)
      }
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('touchmove', onMouseMove)
      window.addEventListener('touchend', onMouseUp)
    },
    [actions, isHorizontal, resizeStart, resizeEnd],
  )

  const getKeyMoveDirection = useCallback(
    (key: string) => {
      let direction: KeyMoveDirection | null = null
      if (
        (isHorizontal && key === 'ArrowLeft') ||
        (!isHorizontal && key === 'ArrowUp')
      ) {
        direction = 'backward'
      } else if (
        (isHorizontal && key === 'ArrowRight') ||
        (!isHorizontal && key === 'ArrowDown')
      ) {
        direction = 'forward'
      }
      return direction
    },
    [isHorizontal],
  )

  const onKeyDown = useCallback(
    (event: ResizableButtonKeyEvent) => {
      const { key, currentTarget } = event
      const direction = getKeyMoveDirection(key)
      const prevPanelId = currentTarget.previousElementSibling!.id
      const nextPanelId = currentTarget.nextElementSibling!.id

      if (direction && prevPanelId && nextPanelId) {
        if (!event.repeat) {
          resizeStart('key', direction)
        }
        event.preventDefault()
        actions.keyMove({ direction, prevPanelId, nextPanelId })
      }
    },
    [actions, getKeyMoveDirection, resizeStart],
  )

  const onKeyUp = useCallback(
    ({ key }: ResizableButtonKeyEvent) => {
      // We only want to signal the end of a resize if the key that was released
      // is the same as the one that started the resize. This prevents the end
      // of a resize if the user presses one arrow key, then presses the opposite
      // arrow key to change direction, then releases the first arrow key.
      if (
        resizeContext.current.trigger === 'key' &&
        resizeContext.current.keyMoveDirection === getKeyMoveDirection(key)
      ) {
        resizeEnd()
      }
    },
    [getKeyMoveDirection, resizeEnd],
  )

  const onBlur = useCallback(() => {
    if (resizeContext.current.trigger === 'key') {
      resizeEnd()
    }
    actions.resizerBlur()
  }, [actions, resizeEnd])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ResizableButton = useCallback(
    resizableButtonWithControls({
      onKeyDown,
      onKeyUp,
      onMouseDown,
      onTouchStart: onMouseDown,
      onFocus: actions.resizerFocus,
      onBlur,
      isHorizontal,
      registration: {
        register: actions.registerResizer,
        deregister: actions.deregisterResizer,
      },
    }),
    [actions, isHorizontal],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ResizablePanel = useCallback(
    resizablePanelWithControls({
      isHorizontal,
      registration: {
        register: actions.registerPanel,
        deregister: actions.deregisterPanel,
      },
      onToggleCollapsed,
      onToggleCollapsedInternal: actions.togglePanel,
    }),
    [actions, isHorizontal],
  )

  const render = () => {
    const DEFAULT = 'custom'
    const content = children(ResizablePanel, ResizableButton, {
      togglePanel: actions.togglePanel,
    })
    const modes = React.isValidElement(content)
      ? content.props.children.map(
        (el: ReactElement) => getModeType(el.props.mode) || DEFAULT,
      )
      : null
    if (
      modes &&
      (['collapsible', 'main'].every((i) => modes.includes(i)) ||
        modes.every((i?: string) => i === DEFAULT))
    ) {
      return content
    }

    throw new Error('Both `collapsible` and `main` mode panels are required.')
  }

  return (
    <ResizableContainerContextProvider
      registry={{
        panels: reducerState.panels,
        resizers: reducerState.resizers,
      }}
    >
      <div className={classes} ref={containerRef} {...rest}>
        {render()}
      </div>
    </ResizableContainerContextProvider>
  )
}
