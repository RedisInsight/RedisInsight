enum IpcInvokeEvent {
  getStoreValue = 'store:get:value',
  deleteStoreValue = 'store:delete:value',
  getAppVersion = 'app:get:version',
  cloudOauth = 'cloud:oauth',
  windowOpen = 'window:open',
  themeChange = 'theme:change',
}

enum IpcOnEvent {
  sendWindowId = 'window:send:id',
  cloudOauthCallback = 'cloud:oauth:callback',
  deepLinkAction = 'deep-link:action',
}

export {
  IpcInvokeEvent,
  IpcOnEvent,
}
