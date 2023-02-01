import { PluginState } from 'src/modules/workbench/models/plugin-state';

export abstract class PluginStateRepository {
  abstract upsert(pluginState: Partial<PluginState>): Promise<void>;
  abstract getOne(visualizationId: string, commandExecutionId: string): Promise<PluginState>;
}
