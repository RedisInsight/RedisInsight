import { KeyboardEvent, MouseEvent, TouchEvent } from 'react'

export type PanelModeType = 'collapsible' | 'main' | 'custom'

export type PanelPosition = 'first' | 'middle' | 'last'

export type PanelDirection = 'left' | 'right'

export interface EuiResizablePanelController {
  id: string
  size: number
  getSizePx: () => number
  minSize: string[]
  mode?: PanelModeType
  isCollapsed: boolean
  prevSize: number
  position: PanelPosition
}

export interface EuiResizableButtonController {
  id: string
  ref: HTMLElement
  isDisabled: boolean
  isFocused: boolean
}

export interface EuiResizableContainerRegistry {
  panels: { [key: string]: EuiResizablePanelController }
  resizers: { [key: string]: EuiResizableButtonController }
}

export type EuiResizableButtonMouseEvent =
  | MouseEvent<HTMLButtonElement>
  | TouchEvent<HTMLButtonElement>

export type EuiResizableButtonKeyDownEvent = KeyboardEvent<HTMLButtonElement>

export interface EuiResizableContainerState {
  isDragging: boolean
  currentResizerPos: number
  prevPanelId: string | null
  nextPanelId: string | null
  containerSize: number
  isHorizontal?: boolean
  panels: EuiResizableContainerRegistry['panels']
  resizers: EuiResizableContainerRegistry['resizers']
}

export interface ActionToggleOptions {
  direction: PanelDirection
}

interface ActionReset {
  type: 'EUI_RESIZABLE_RESET'
}

interface ActionInit {
  type: 'EUI_RESIZABLE_CONTAINER_INIT'
  payload: { isHorizontal: boolean }
}

export interface ActionDragStart {
  type: 'EUI_RESIZABLE_DRAG_START'
  payload: { prevPanelId: string; nextPanelId: string; position: number }
}

export interface ActionDragMove {
  type: 'EUI_RESIZABLE_DRAG_MOVE'
  payload: { prevPanelId: string; nextPanelId: string; position: number }
}

export interface ActionKeyMove {
  type: 'EUI_RESIZABLE_KEY_MOVE'
  payload: {
    prevPanelId: string
    nextPanelId: string
    direction: 'forward' | 'backward'
  }
}

export interface ActionResize {
  type: 'EUI_RESIZABLE_RESIZE'
  payload: {}
}

export interface ActionToggle {
  type: 'EUI_RESIZABLE_TOGGLE'
  payload: {
    panelId: string
    options: ActionToggleOptions
  }
}

interface ActionRegisterPanel {
  type: 'EUI_RESIZABLE_PANEL_REGISTER'
  payload: {
    panel: EuiResizablePanelController
  }
}

interface ActionDeregisterPanel {
  type: 'EUI_RESIZABLE_PANEL_DEREGISTER'
  payload: {
    panelId: EuiResizablePanelController['id']
  }
}

interface ActionRegisterResizer {
  type: 'EUI_RESIZABLE_BUTTON_REGISTER'
  payload: {
    resizer: EuiResizableButtonController
  }
}

interface ActionDeregisterResizer {
  type: 'EUI_RESIZABLE_BUTTON_DEREGISTER'
  payload: {
    resizerId: EuiResizableButtonController['id']
  }
}

export interface ActionFocus {
  type: 'EUI_RESIZABLE_BUTTON_FOCUS'
  payload: {
    resizerId: EuiResizableButtonController['id']
  }
}

interface ActionBlur {
  type: 'EUI_RESIZABLE_BUTTON_BLUR'
}
interface ActionOnChange {
  type: 'EUI_RESIZABLE_ONCHANGE'
}

export type EuiResizableContainerAction =
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

export interface EuiResizableContainerActions {
  reset: () => void
  initContainer: (isHorizontal: boolean) => void
  registerPanel: (panel: EuiResizablePanelController) => void
  deregisterPanel: (panelId: EuiResizablePanelController['id']) => void
  registerResizer: (resizer: EuiResizableButtonController) => void
  deregisterResizer: (resizerId: EuiResizableButtonController['id']) => void
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
