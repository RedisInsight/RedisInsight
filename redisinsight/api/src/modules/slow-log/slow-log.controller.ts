import {
  Body,
  Controller, Delete, Get, Param, Patch, Query, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { SlowLogService } from 'src/modules/slow-log/slow-log.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { SlowLog, SlowLogConfig } from 'src/modules/slow-log/models';
import { AppTool } from 'src/models';
import { UpdateSlowLogConfigDto } from 'src/modules/slow-log/dto/update-slow-log-config.dto';
import { GetSlowLogsDto } from 'src/modules/slow-log/dto/get-slow-logs.dto';

@ApiTags('Slow Logs')
@Controller('slow-logs')
@UsePipes(new ValidationPipe({ transform: true }))
export class SlowLogController {
  constructor(
    private service: SlowLogService,
  ) {}

  @ApiEndpoint({
    description: 'List of slow logs',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: SlowLog,
        isArray: true,
      },
    ],
  })
  @Get('')
  async getSlowLogs(
    @Param('dbInstance') instanceId: string,
      @Query() getSlowLogsDto: GetSlowLogsDto,
  ): Promise<any> {
    return this.service.getSlowLogs({
      instanceId,
      tool: AppTool.Common,
    }, getSlowLogsDto);
  }

  @ApiEndpoint({
    description: 'Clear slow logs',
    statusCode: 200,
  })
  @Delete('')
  async resetSlowLogs(
    @Param('dbInstance') instanceId: string,
  ): Promise<void> {
    return this.service.reset({
      instanceId,
      tool: AppTool.Common,
    });
  }

  @ApiEndpoint({
    description: 'Get slowlog config',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: SlowLogConfig,
      },
    ],
  })
  @Get('config')
  async getConfig(
    @Param('dbInstance') instanceId: string,
  ): Promise<SlowLogConfig> {
    return this.service.getConfig({
      instanceId,
      tool: AppTool.Common,
    });
  }

  @ApiEndpoint({
    description: 'Update slowlog config',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: SlowLogConfig,
      },
    ],
  })
  @Patch('config')
  async updateConfig(
    @Param('dbInstance') instanceId: string,
      @Body() dto: UpdateSlowLogConfigDto,
  ): Promise<SlowLogConfig> {
    return this.service.updateConfig({
      instanceId,
      tool: AppTool.Common,
    }, dto);
  }
}
