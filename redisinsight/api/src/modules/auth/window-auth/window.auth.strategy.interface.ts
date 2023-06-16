export interface IWindowAuthStrategyData {
  isExists: boolean
}
export interface IWindowAuthStrategy {
  isWindowExists(windowId: string): Promise<IWindowAuthStrategyData>
}
