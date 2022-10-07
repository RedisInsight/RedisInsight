// unique constraint: commandExecutionId + visualizationId
export class PluginState {
  commandExecutionId: string;

  visualizationId: string;

  state: string;

  encryption: string;

  createdAt: Date;

  updatedAt: Date;
}
