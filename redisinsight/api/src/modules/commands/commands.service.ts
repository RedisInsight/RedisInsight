import { assign } from 'lodash';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';

@Injectable()
export class CommandsService implements OnModuleInit {
  private commandsProviders;

  constructor(commandsProviders: CommandsJsonProvider[] = []) {
    this.commandsProviders = commandsProviders;
  }

  /**
   * Updates latest jsons on startup
   */
  async onModuleInit() {
    // async operation to not wait for it and not block user in case when no internet connection
    Promise.all(this.commandsProviders.map((provider) => provider.updateLatestJson()));
  }

  /**
   * Get all commands merged into single object
   */
  async getAll(): Promise<any> {
    return assign(
      {},
      ...Object.values(await this.getCommandsObject()) ,
    )
  }

  async getCommandsObject(): Promise<any> {
    const commandsObject = await assign(
      {},
      ...(await Promise.all(this.commandsProviders.map((provider) => provider.getCommands()))),
    );

    return assign(
      {},
      ...(await Promise.all(this.commandsProviders.map((provider) => provider.getCommands()))),
    );
  }
}
