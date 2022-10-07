import { PluginState } from './models/plugin-state';

export interface IPluginStateProvider {
  get(visualizationId: string, commandExecutionId: string): Promise<PluginState>
  upsert(pluginState: PluginState): Promise<void>
}
