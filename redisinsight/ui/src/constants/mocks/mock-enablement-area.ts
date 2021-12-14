import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'

export const MOCK_ENABLEMENT_AREA_ITEMS: Record<string, IEnablementAreaItem> = {
  'quick-guides': {
    type: EnablementAreaComponent.Group,
    id: 'quick-guides',
    label: 'Quick Guides',
    children: {
      'document-capabilities': {
        type: EnablementAreaComponent.InternalLink,
        id: 'document-capabilities',
        label: 'Document Capabilities',
        args: {
          path: 'static/workbench/quick-guides/document-capabilities.html',
        },
      },
      'working-with-json': {
        type: EnablementAreaComponent.InternalLink,
        id: 'working-with-json',
        label: 'Working with JSON',
        args: {
          path: 'static/workbench/quick-guides/working-with-json.html',
        },
      },
      'working-with-hash': {
        type: EnablementAreaComponent.InternalLink,
        id: 'working-with-hash',
        label: 'Working with HASH',
        args: {
          path: 'static/workbench/quick-guides/working-with-hash.html',
        },
      }
    }
  },
  'internal-page': {
    type: EnablementAreaComponent.InternalLink,
    id: 'internal-page',
    label: 'Internal Page',
    args: {
      path: 'static/workbench/quick-guides/document-capabilities.html'
    },
  },
  'second-internal-page': {
    type: EnablementAreaComponent.InternalLink,
    id: 'second-internal-page',
    label: 'Second Internal Page',
    args: {
      path: 'static/workbench/quick-guides/document-capabilities.html'
    },
  },
  'manual': {
    type: EnablementAreaComponent.CodeButton,
    id: 'manual',
    label: 'Manual',
    args: {
      path: 'static/workbench/_scripts/manual.txt'
    },
  }
}
