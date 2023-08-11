import TextViewIconDark from 'uiSrc/assets/img/workbench/text_view_dark.svg'
import TextViewIconLight from 'uiSrc/assets/img/workbench/text_view_light.svg'

export const WORKBENCH_HISTORY_WRAPPER_NAME = 'WORKBENCH'
export const WORKBENCH_HISTORY_MAX_LENGTH = 30

export enum WBQueryType {
  Text = 'Text',
  Plugin = 'Plugin'
}

export const DEFAULT_TEXT_VIEW_TYPE = {
  id: 'default__Text',
  text: 'Text',
  name: 'default__Text',
  value: WBQueryType.Text,
  iconDark: TextViewIconDark,
  iconLight: TextViewIconLight,
  internal: true,
}

export const VIEW_TYPE_OPTIONS = [
  DEFAULT_TEXT_VIEW_TYPE,
]

export const getViewTypeOptions = () =>
  [...VIEW_TYPE_OPTIONS]

export const SEARCH_COMMANDS = ['ft.search', 'ft.aggregate']
export const GRAPH_COMMANDS = ['graph.query']

const ALLOWED_PROFILE_COMMANDS = [...SEARCH_COMMANDS, ...GRAPH_COMMANDS]

export const isCommandAllowedForProfile = (query: string) => ALLOWED_PROFILE_COMMANDS.includes(query?.split(' ')?.[0]?.toLowerCase())

export enum ProfileQueryType {
  Profile = 'Profile',
  Explain = 'Explain'
}

const PROFILE_VIEW_TYPE_OPTIONS = [
  {
    id: ProfileQueryType.Profile,
    text: 'Profile the command',
    name: 'Profile',
    value: WBQueryType.Text,
  },
  {
    id: ProfileQueryType.Explain,
    text: 'Explain the command',
    name: 'Explain',
    value: WBQueryType.Text,
  },
]

export const getProfileViewTypeOptions = () =>
  [...PROFILE_VIEW_TYPE_OPTIONS]

export enum ModuleCommandPrefix {
  RediSearch = 'FT.',
  JSON = 'JSON.',
  TimeSeries = 'TS.',
  Graph = 'GRAPH.',
  BF = 'BF.',
  CF = 'CF.',
  CMS = 'CMS.',
  TOPK = 'TOPK.',
  TDIGEST = 'TDIGEST.',
  TriggersAndFunctions = 'TF',
}
