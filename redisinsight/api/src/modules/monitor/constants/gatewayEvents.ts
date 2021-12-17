export enum MonitorGatewayClientEvents {
  MonitorStart = 'starMonitorToServer',
  MonitorStop = 'stopMonitorToServer',
  Disconnect = 'disconnect',
}

export enum MonitorGatewayServerEvents {
  MonitorStarted = 'monitorStartedToClient',
  MonitorStopped = 'monitorStoppedToClient',
  MonitorEvent = 'monitorEventToClient',
}
