import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'

export const MOCK_ENABLEMENT_AREA_ITEMS: IEnablementAreaItem[] = [
  {
    type: EnablementAreaComponent.Group,
    id: 'quick-guides',
    label: 'Quick Guides',
    children: [
      {
        type: EnablementAreaComponent.InternalLink,
        id: 'document-capabilities',
        label: 'Document Capabilities',
        args: {
          path: 'static/workbench/guides/document-capabilities.html',
        },
      }
    ]
  },
  {
    type: EnablementAreaComponent.InternalLink,
    id: 'internal-page',
    label: 'Internal Page',
    args: {
      path: 'static/workbench/guides/document-capabilities.html'
    },
  },
  {
    type: EnablementAreaComponent.CodeButton,
    id: 'manual',
    label: 'Manual',
    args: {
      path: 'static/workbench/scripts/manual.txt'
    },
  }
]
