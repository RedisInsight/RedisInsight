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
      'document': {
        type: EnablementAreaComponent.InternalLink,
        id: 'document',
        label: 'Document',
        args: {
          path: 'static/workbench/quick-guides/document.html',
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
  'manual': {
    type: EnablementAreaComponent.CodeButton,
    id: 'manual',
    label: 'Manual',
    args: {
      path: 'static/workbench/_scripts/manual.txt'
    },
  }
}
