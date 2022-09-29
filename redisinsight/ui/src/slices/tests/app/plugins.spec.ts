import { cloneDeep, flatMap, isEmpty, reject } from 'lodash'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { IPlugin, PluginsResponse } from 'uiSrc/slices/interfaces'
import reducer, {
  appPluginsSelector,
  getAllPlugins, getAllPluginsFailure, getAllPluginsSuccess,
  initialState,
} from '../../app/plugins'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const MOCK_PLUGINS_RESPONSE = {
  static: '/static/resources/plugins',
  plugins: [
    {
      styles: '/static/plugins/redisearch/dist/styles.css',
      main: '/static/plugins/redisearch/dist/index.js',
      name: 'redisearch',
      visualizations: [
        {
          id: 'redisearch',
          name: 'Table',
          activationMethod: 'renderRediSearch',
          matchCommands: [
            'FT.INFO',
            'FT.SEARCH',
            'FT.AGGREGATE'
          ],
          iconDark: './dist/table_view_icon_dark.svg',
          iconLight: './dist/table_view_icon_light.svg',
          default: true
        }
      ],
      internal: true,
      baseUrl: '/static/plugins/redisearch/'
    }
  ]
}

/**
 * slices tests
 *
 * @group unit
 */
describe('slices', () => {
/**
 * reducer, actions and selectors tests
 *
 * @group unit
 */
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  /**
 * getAllPlugins tests
 *
 * @group unit
 */
  describe('getAllPlugins', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading
      }

      // Act
      const nextState = reducer(initialState, getAllPlugins())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { plugins: nextState },
      })

      expect(appPluginsSelector(rootState)).toEqual(state)
    })
  })

  /**
 * getAllPluginsSuccess tests
 *
 * @group unit
 */
  describe('getAllPluginsSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const data: PluginsResponse = MOCK_PLUGINS_RESPONSE
      const state = {
        ...initialState,
        staticPath: data.static,
        plugins: reject(data?.plugins, isEmpty),
        visualizations: flatMap(
          reject(data?.plugins, isEmpty),
          (plugin: IPlugin) => plugin.visualizations.map((view) => ({
            ...view,
            plugin: {
              name: plugin.name,
              baseUrl: plugin.baseUrl,
              internal: plugin.internal,
              stylesSrc: plugin.styles,
              scriptSrc: plugin.main
            },
            uniqId: `${plugin.name}__${view.id}`
          }))
        )
      }

      // Act
      const nextState = reducer(initialState, getAllPluginsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { plugins: nextState },
      })

      expect(appPluginsSelector(rootState)).toEqual(state)
    })
  })

  /**
 * getAllPluginsFailure tests
 *
 * @group unit
 */
  describe('getAllPluginsFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error
      }

      // Act
      const nextState = reducer(initialState, getAllPluginsFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { plugins: nextState },
      })

      expect(appPluginsSelector(rootState)).toEqual(state)
    })
  })
})
