import { IEnablementAreaItem, OAuthSocialSource, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { store } from 'uiSrc/slices/store'
import { Nullable } from 'uiSrc/utils'
import { findMarkdownPathById } from 'uiSrc/utils/workbench'

const getCapability = (
  telemetryName: string = '',
  name: string = '',
  tutorialPage: Nullable<IEnablementAreaItem> = null
) => ({
  telemetryName, name, tutorialPage
})

export const getSourceTutorialByCapability = (moduleName = '') => `${moduleName}_tutorial`
export const showCapabilityTutorialPopover = () => {
  const state = store.getState()

  return !!state.connections.instances?.connectedInstance?.cloudDetails?.free
    && !state.app.context.capability?.tutorialPopoverShown
}

export const getTutorialCapability = (source: any = '') => {
  switch (source) {
    // RediSearch
    case OAuthSocialSource.RediSearch:
    case OAuthSocialSource.BrowserSearch:
    case getSourceTutorialByCapability(RedisDefaultModules.SearchLight):
    case getSourceTutorialByCapability(RedisDefaultModules.Search):
    case getSourceTutorialByCapability(RedisDefaultModules.FT):
    case getSourceTutorialByCapability(RedisDefaultModules.FTL):
      return getCapability(
        'searchAndQuery',
        'Search and Query capability',
        findMarkdownPathById(store.getState()?.workbench?.tutorials?.items, 'vector_similarity_search')
      )

    // RedisJSON
    case OAuthSocialSource.RedisJSON:
    case getSourceTutorialByCapability(RedisDefaultModules.ReJSON):
      return getCapability(
        'JSON',
        'JSON capability',
        findMarkdownPathById(store.getState()?.workbench?.tutorials?.items, 'working_with_json')
      )

    // TimeSeries
    case OAuthSocialSource.RedisTimeSeries:
    case getSourceTutorialByCapability(RedisDefaultModules.TimeSeries):
      return getCapability(
        'timeSeries',
        'time series data structure',
        findMarkdownPathById(store.getState()?.workbench?.tutorials?.items, 'redis_for_time_series')
      )

    // Bloom
    case OAuthSocialSource.RedisBloom:
    case getSourceTutorialByCapability(RedisDefaultModules.Bloom):
      return getCapability(
        'probabilistic',
        'probabilistic data structures',
        findMarkdownPathById(store.getState()?.workbench?.tutorials?.items, 'probabilistic_data_structures')
      )

    default:
      return getCapability()
  }
}
