import { FunctionType } from 'uiSrc/slices/interfaces/triggeredFunctions'

enum TriggeredFunctionsViewTabs {
  Libraries = 'libraries',
  Functions = 'functions'
}

const triggeredFunctionsViewTabs: Array<{ id: TriggeredFunctionsViewTabs, label: string }> = [
  {
    id: TriggeredFunctionsViewTabs.Libraries,
    label: 'Libraries',
  },
  {
    id: TriggeredFunctionsViewTabs.Functions,
    label: 'Functions',
  },
]
const LIST_OF_FUNCTION_NAMES = {
  [FunctionType.Function]: 'Functions',
  [FunctionType.KeyspaceTrigger]: 'Keyspace triggers',
  [FunctionType.ClusterFunction]: 'Cluster Functions',
  [FunctionType.StreamTrigger]: 'Stream Functions',
}

const LIST_OF_FUNCTION_TYPES = [
  { title: 'Functions', type: FunctionType.Function },
  { title: 'Keyspace triggers', type: FunctionType.KeyspaceTrigger },
  { title: 'Cluster Functions', type: FunctionType.ClusterFunction },
  { title: 'Stream Functions', type: FunctionType.StreamTrigger },
]

enum LibDetailsSelectedView {
  Code = 'code',
  Config = 'config'
}

const LIB_DETAILS_TABS = [
  { id: LibDetailsSelectedView.Code, label: 'Library Code' },
  { id: LibDetailsSelectedView.Config, label: 'Configuration' }
]

export {
  TriggeredFunctionsViewTabs,
  triggeredFunctionsViewTabs,
  LIST_OF_FUNCTION_NAMES,
  LIST_OF_FUNCTION_TYPES,
  LibDetailsSelectedView,
  LIB_DETAILS_TABS,
}
