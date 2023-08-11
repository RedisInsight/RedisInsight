import { ReactComponent as SearchIcon } from 'uiSrc/assets/img/guides/search.svg'
import { ReactComponent as ProbabilisticDataIcon } from 'uiSrc/assets/img/guides/probabilistic-data.svg'
import { ReactComponent as JSONIcon } from 'uiSrc/assets/img/guides/json.svg'
import { ReactComponent as TimeSeriesIcon } from 'uiSrc/assets/img/guides/time-series.svg'
import { ReactComponent as TriggersAndFunctionsIcon } from 'uiSrc/assets/img/guides/triggers-and-functions.svg'
import { ReactComponent as VectorSimilarity } from 'uiSrc/assets/img/guides/vector-similarity.svg'

const GUIDE_ICONS: Record<string, any> = {
  search: SearchIcon,
  json: JSONIcon,
  'probabilistic-data-structures': ProbabilisticDataIcon,
  'time-series': TimeSeriesIcon,
  'triggers-and-functions': TriggersAndFunctionsIcon,
  'vector-similarity-search': VectorSimilarity
}

export default GUIDE_ICONS
