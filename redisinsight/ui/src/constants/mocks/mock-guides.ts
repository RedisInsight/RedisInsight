import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'

export const MOCK_GUIDES_ITEMS: IEnablementAreaItem[] = [
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
          path: '/static/workbench/quick-guides/document/learn-more.md',
        },
      },
      {
        type: EnablementAreaComponent.InternalLink,
        id: 'working-with-json',
        label: 'Working with JSON',
        args: {
          path: '/quick-guides/working-with-json.html',
        },
        _path: '/123123-123123'
      },
      {
        type: EnablementAreaComponent.InternalLink,
        id: 'working-with-hash',
        label: 'Working with HASH',
        args: {
          path: 'quick-guides/working-with-hash.html',
        },
      }
    ]
  },
  {
    type: EnablementAreaComponent.InternalLink,
    id: 'internal-page',
    label: 'Internal Page',
    args: {
      path: 'quick-guides/document-capabilities.html'
    },
  },
  {
    type: EnablementAreaComponent.InternalLink,
    id: 'second-internal-page',
    label: 'Second Internal Page',
    args: {
      path: 'quick-guides/document-capabilities.html'
    },
  },
  {
    type: EnablementAreaComponent.CodeButton,
    id: 'manual',
    label: 'Manual',
    args: {
      path: '_scripts/manual.txt'
    },
  },
]

export const MOCK_GUIDES = {
  type: EnablementAreaComponent.Group,
  id: 'quick-guides',
  label: 'Quick Guides',
  children: MOCK_GUIDES_ITEMS
}
