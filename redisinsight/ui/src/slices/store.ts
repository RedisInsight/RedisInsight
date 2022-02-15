import { createBrowserHistory } from 'history'
import { configureStore, combineReducers } from '@reduxjs/toolkit'

import instancesReducer from './instances'
import caCertsReducer from './caCerts'
import clientCertsReducer from './clientCerts'
import clusterReducer from './cluster'
import cloudReducer from './cloud'
import sentinelReducer from './sentinel'
import keysReducer from './keys'
import stringReducer from './string'
import zsetReducer from './zset'
import setReducer from './set'
import hashReducer from './hash'
import listReducer from './list'
import rejsonReducer from './rejson'
import notificationsReducer from './app/notifications'
import cliSettingsReducer from './cli/cli-settings'
import outputReducer from './cli/cli-output'
import monitorReducer from './cli/monitor'
import userSettingsReducer from './user/user-settings'
import appInfoReducer from './app/info'
import appContextReducer from './app/context'
import appRedisCommandsReducer from './app/redis-commands'
import appPluginsReducer from './app/plugins'
import workbenchResultsReducer from './workbench/wb-results'
import workbenchEnablementAreaReducer from './workbench/wb-enablement-area'
import contentCreateDatabaseReducer from './content/content-create-database'

export const history = createBrowserHistory()

export const rootReducer = combineReducers({
  app: combineReducers({
    info: appInfoReducer,
    notifications: notificationsReducer,
    context: appContextReducer,
    redisCommands: appRedisCommandsReducer,
    plugins: appPluginsReducer
  }),
  connections: combineReducers({
    instances: instancesReducer,
    caCerts: caCertsReducer,
    clientCerts: clientCertsReducer,
    cluster: clusterReducer,
    cloud: cloudReducer,
    sentinel: sentinelReducer,
  }),
  browser: combineReducers({
    keys: keysReducer,
    string: stringReducer,
    zset: zsetReducer,
    set: setReducer,
    hash: hashReducer,
    list: listReducer,
    rejson: rejsonReducer,
  }),
  cli: combineReducers({
    settings: cliSettingsReducer,
    output: outputReducer,
    monitor: monitorReducer,
  }),
  user: combineReducers({
    settings: userSettingsReducer,
  }),
  workbench: combineReducers({
    results: workbenchResultsReducer,
    enablementArea: workbenchEnablementAreaReducer,
  }),
  content: combineReducers({
    createDatabase: contentCreateDatabaseReducer,
  }),
})

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, }),
  devTools: process.env.NODE_ENV !== 'production',
})

export default store

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
