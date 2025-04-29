enum IpcInvokeEvent {
  getStoreValue = 'store:get:value',
  deleteStoreValue = 'store:delete:value',
  getAppVersion = 'app:get:version',
  cloudOauth = 'cloud:oauth',
  windowOpen = 'window:open',
  themeChange = 'theme:change',
  appRestart = 'app:restart',
  microsoftAuth = 'microsoft-auth',
  microsoftAuthEdit = 'microsoft-auth-edit',
}

enum IpcOnEvent {
  sendWindowId = 'window:send:id',
  cloudOauthCallback = 'cloud:oauth:callback',
  deepLinkAction = 'deep-link:action',
  appUpdateAvailable = 'app:update:available',
  microsoftAuthCallback = 'microsoft:auth:callback',
  microsoftAuthEditCallback = 'microsoft:auth-edit:callback',
}

export {
  IpcInvokeEvent,
  IpcOnEvent,
}
