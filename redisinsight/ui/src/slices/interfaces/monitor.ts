import { Socket } from 'socket.io-client'
import { Nullable } from 'uiSrc/utils'
import { IOnDatePayload } from 'apiSrc/modules/profiler/helpers/client-monitor-observer'

export interface IMonitorDataPayload extends Partial<IOnDatePayload>{
  isError?: boolean
  message?: string
}

export interface StateMonitor {
  isShowMonitor: boolean
  isMinimizedMonitor: boolean
  isRunning: boolean
  isStarted: boolean
  socket: Nullable<Socket>
  items: IMonitorDataPayload[]
  error: string
}
