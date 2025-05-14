import { KeyboardEvent, MouseEvent, TouchEvent } from 'react'

export type PanelModeType = 'collapsible' | 'main' | 'custom'

export type PanelPosition = 'first' | 'middle' | 'last'

export type PanelDirection = 'left' | 'right'

export type KeyMoveDirection = 'forward' | 'backward'

export type ResizeTrigger = 'pointer' | 'key'

export interface ResizablePanelController {
  id: string
  size: number
  getSizePx: () => number
  minSize: string[]
  mode?: PanelModeType
  isCollapsed: boolean
  prevSize: number
  position: PanelPosition
}

export interface ResizableButtonController {
  id: string
  ref: HTMLElement
  isDisabled: boolean
  isFocused: boolean
}

export interface ResizableContainerRegistry {
  panels: { [key: string]: ResizablePanelController }
  resizers: { [key: string]: ResizableButtonController }
}

export type ResizableButtonMouseEvent =
  | MouseEvent<HTMLButtonElement>
  | TouchEvent<HTMLButtonElement>

export type ResizableButtonKeyEvent = KeyboardEvent<HTMLButtonElement>

export interface ResizableContainerState {
  isDragging: boolean
  currentResizerPos: number
  prevPanelId: string | null
  nextPanelId: string | null
  containerSize: number
  isHorizontal?: boolean
  panels: ResizableContainerRegistry['panels']
  resizers: ResizableContainerRegistry['resizers']
}

export interface ActionToggleOptions {
  direction: PanelDirection
}

interface ActionReset {
  type: 'RESIZABLE_RESET'
}

interface ActionInit {
  type: 'RESIZABLE_CONTAINER_INIT'
  payload: { isHorizontal: boolean }
}

export interface ActionDragStart {
  type: 'RESIZABLE_DRAG_START'
  payload: { prevPanelId: string; nextPanelId: string; position: number }
}

export interface ActionDragMove {
  type: 'RESIZABLE_DRAG_MOVE'
  payload: { prevPanelId: string; nextPanelId: string; position: number }
}

export interface ActionKeyMove {
  type: 'RESIZABLE_KEY_MOVE'
  payload: {
    prevPanelId: string
    nextPanelId: string
    direction: 'forward' | 'backward'
  }
}

export interface ActionResize {
  type: 'RESIZABLE_RESIZE'
  payload: {}
}

export interface ActionToggle {
  type: 'RESIZABLE_TOGGLE'
  payload: {
    panelId: string
    options: ActionToggleOptions
  }
}

interface ActionRegisterPanel {
  type: 'RESIZABLE_PANEL_REGISTER'
  payload: {
    panel: ResizablePanelController
  }
}

interface ActionDeregisterPanel {
  type: 'RESIZABLE_PANEL_DEREGISTER'
  payload: {
    panelId: ResizablePanelController['id']
  }
}

interface ActionRegisterResizer {
  type: 'RESIZABLE_BUTTON_REGISTER'
  payload: {
    resizer: ResizableButtonController
  }
}

interface ActionDeregisterResizer {
  type: 'RESIZABLE_BUTTON_DEREGISTER'
  payload: {
    resizerId: ResizableButtonController['id']
  }
}

export interface ActionFocus {
  type: 'RESIZABLE_BUTTON_FOCUS'
  payload: {
    resizerId: ResizableButtonController['id']
  }
}

interface ActionBlur {
  type: 'RESIZABLE_BUTTON_BLUR'
}
interface ActionOnChange {
  type: 'RESIZABLE_ONCHANGE'
}

export type ResizableContainerAction =
  | ActionReset
  | ActionInit
  | ActionRegisterPanel
  | ActionDeregisterPanel
  | ActionRegisterResizer
  | ActionDeregisterResizer
  | ActionDragStart
  | ActionDragMove
  | ActionKeyMove
  | ActionResize
  | ActionToggle
  | ActionFocus
  | ActionBlur
  | ActionOnChange

export interface ResizableContainerActions {
  reset: () => void
  initContainer: (isHorizontal: boolean) => void
  registerPanel: (panel: ResizablePanelController) => void
  deregisterPanel: (panelId: ResizablePanelController['id']) => void
  registerResizer: (resizer: ResizableButtonController) => void
  deregisterResizer: (resizerId: ResizableButtonController['id']) => void
  dragStart: ({
    prevPanelId,
    nextPanelId,
    position,
  }: ActionDragStart['payload']) => void
  dragMove: ({
    prevPanelId,
    nextPanelId,
    position,
  }: ActionDragMove['payload']) => void
  keyMove: ({
    prevPanelId,
    nextPanelId,
    direction,
  }: ActionKeyMove['payload']) => void
  resizerFocus: (resizerId: ActionFocus['payload']['resizerId']) => void
  resizerBlur: () => void
  togglePanel: (
    panelId: ActionToggle['payload']['panelId'],
    options: ActionToggle['payload']['options'],
  ) => void
}
