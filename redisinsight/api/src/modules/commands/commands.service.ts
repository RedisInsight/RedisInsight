import { Inject, Injectable } from '@nestjs/common';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';

@Injectable()
export class CommandsService {
  constructor(
    @Inject('redisearchCommandsProvider')
    private redisearchCommandsProvider: CommandsJsonProvider,
    @Inject('redijsonCommandsProvider')
    private redijsonCommandsProvider: CommandsJsonProvider,
    @Inject('redistimeseriesCommandsProvider')
    private redistimeseriesCommandsProvider: CommandsJsonProvider,
    @Inject('redisaiCommandsProvider')
    private redisaiCommandsProvider: CommandsJsonProvider,
    @Inject('redisgraphCommandsProvider')
    private redisgraphCommandsProvider: CommandsJsonProvider,
    @Inject('mainCommandsProvider')
    private mainCommandsProvider: CommandsJsonProvider,
  ) {}

  /**
   * Get all commands merged into single object
   */
  async getAll(): Promise<Record<string, any>> {
    return {
      ...(await this.redisearchCommandsProvider.getCommands()),
      ...(await this.redijsonCommandsProvider.getCommands()),
      ...(await this.redistimeseriesCommandsProvider.getCommands()),
      ...(await this.redisaiCommandsProvider.getCommands()),
      ...(await this.redisgraphCommandsProvider.getCommands()),
      ...(await this.mainCommandsProvider.getCommands()),
    };
  }
}
