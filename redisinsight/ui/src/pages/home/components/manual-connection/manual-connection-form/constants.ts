export enum ManualFormTab {
  General = 'general',
  Security = 'security',
  Decompression = 'decompression',
}

export const MANUAL_FORM_TABS = [
  { id: ManualFormTab.General, title: 'General' },
  { id: ManualFormTab.Security, title: 'Security' },
  { id: ManualFormTab.Decompression, title: 'Decompression & Formatters' },
]
