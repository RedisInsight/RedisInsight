import {
  Body, ClassSerializerInterceptor, Controller, Get, Param, Post, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { AppTool } from 'src/models';
import { CreateCommandExecutionDto } from 'src/modules/workbench/dto/create-command-execution.dto';
import { PluginsService } from 'src/modules/workbench/plugins.service';
import { PluginCommandExecution } from 'src/modules/workbench/models/plugin-command-execution';

@ApiTags('Plugins')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('plugins')
export class PluginsController {
  constructor(private service: PluginsService) {}

  @ApiEndpoint({
    description: 'Send Redis Command from the Workbench',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: PluginCommandExecution,
      },
    ],
  })
  @Post('/command-executions')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiRedisParams()
  async sendCommand(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: CreateCommandExecutionDto,
  ): Promise<PluginCommandExecution> {
    return this.service.sendCommand(
      {
        instanceId: dbInstance,
        tool: AppTool.Workbench,
      },
      dto,
    );
  }

  @ApiEndpoint({
    description: 'Get Redis whitelist commands available for plugins',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'List of available commands',
        type: [String],
      },
    ],
  })
  @Get('/commands')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiRedisParams()
  async getPluginCommands(
    @Param('dbInstance') databaseId: string,
  ): Promise<string[]> {
    return this.service.getWhitelistCommands(databaseId);
  }
}
