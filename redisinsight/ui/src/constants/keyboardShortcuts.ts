import { isMacOs } from 'uiSrc/utils/handlePlatforms'

// TODO: use i18n file for labels
const COMMON_SHORTCUTS = {
  _separator: '+',
  workbench: {
    runQuery: {
      label: 'Run',
      keys: ['Ctrl', 'Enter'],
    },
  }
}

const MAC_SHORTCUTS = {
  _separator: '',
  workbench: {
    runQuery: {
      label: 'Run',
      keys: ['⌘', 'Enter'],
    },
  }
}

export const KEYBOARD_SHORTCUTS = isMacOs() ? MAC_SHORTCUTS : COMMON_SHORTCUTS
