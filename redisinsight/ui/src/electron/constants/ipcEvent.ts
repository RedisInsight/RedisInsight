enum IpcInvokeEvent {
  getStoreValue = 'getStoreValue',
  deleteStoreValue = 'deleteStoreValue',
  getAppVersion = 'getAppVersion',
}

enum IpcOnEvent {
  sendWindowId = 'sendWindowId',
  sendSsoConnected = 'sendSsoConnected',
}

export {
  IpcInvokeEvent,
  IpcOnEvent,
}
