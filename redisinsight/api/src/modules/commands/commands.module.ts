import { Module } from '@nestjs/common';
import { CommandsController } from 'src/modules/commands/commands.controller';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';
import config from 'src/utils/config';
import * as defaultMainCommands from 'src/constants/commands/main.json';
import * as defaultRedisearchCommands from 'src/constants/commands/redisearch.json';
import * as defaultRedijsonCommands from 'src/constants/commands/redijson.json';
import * as defaultRedistimeseriesCommands from 'src/constants/commands/redistimeseries.json';
import * as defaultRedisaiCommands from 'src/constants/commands/redisai.json';
import * as defaultRedisgraphCommands from 'src/constants/commands/redisgraph.json';

const COMMANDS_CONFIG = config.get('commands');

@Module({
  controllers: [CommandsController],
  providers: [
    CommandsService,
    {
      provide: 'mainCommandsProvider',
      useFactory: () => new CommandsJsonProvider(
        'main',
        COMMANDS_CONFIG.mainUrl,
        defaultMainCommands,
      ),
    },
    {
      provide: 'redisearchCommandsProvider',
      useFactory: () => new CommandsJsonProvider(
        'redisearch',
        COMMANDS_CONFIG.redisearchUrl,
        defaultRedisearchCommands,
      ),
    },
    {
      provide: 'redijsonCommandsProvider',
      useFactory: () => new CommandsJsonProvider(
        'redijson',
        COMMANDS_CONFIG.redijsonUrl,
        defaultRedijsonCommands,
      ),
    },
    {
      provide: 'redistimeseriesCommandsProvider',
      useFactory: () => new CommandsJsonProvider(
        'redistimeseries',
        COMMANDS_CONFIG.redistimeseriesUrl,
        defaultRedistimeseriesCommands,
      ),
    },
    {
      provide: 'redisaiCommandsProvider',
      useFactory: () => new CommandsJsonProvider(
        'redisai',
        COMMANDS_CONFIG.redisaiUrl,
        defaultRedisaiCommands,
      ),
    },
    {
      provide: 'redisgraphCommandsProvider',
      useFactory: () => new CommandsJsonProvider(
        'redisgraph',
        COMMANDS_CONFIG.redisgraphUrl,
        defaultRedisgraphCommands,
      ),
    },
  ],
})
export class CommandsModule {}
