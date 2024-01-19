import GUIDE_ICONS from 'uiSrc/components/explore-guides/icons'

interface CapabilityPromotion {
  title: string
  id: string
  icon: keyof typeof GUIDE_ICONS
}

// TODO: change id
export const capabilities: CapabilityPromotion[] = [
  {
    title: 'Search and query',
    id: '/quick-guides/document/introduction.md',
    icon: GUIDE_ICONS.search
  },
  {
    title: 'JSON',
    id: '/quick-guides/document/working-with-json.md',
    icon: GUIDE_ICONS.json
  },
  {
    title: 'Triggers and functions',
    id: '/quick-guides/triggers-and-functions/introduction.md',
    icon: GUIDE_ICONS['triggers-and-functions']
  },
  {
    title: 'Time series',
    id: '/quick-guides/time-series/introduction.md',
    icon: GUIDE_ICONS['time-series']
  },
  {
    title: 'Probabilistic',
    id: '/quick-guides/probabilistic-data-structures/introduction.md',
    icon: GUIDE_ICONS['probabilistic-data-structures']
  }
]
