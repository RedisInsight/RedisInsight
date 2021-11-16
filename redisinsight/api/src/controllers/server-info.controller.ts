import {
  Controller,
  Get,
  Inject,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import {
  getBlockingCommands,
  getUnsupportedCommands,
} from 'src/utils/cli-helper';
import { IServerProvider } from 'src/modules/core/models/server-provider.interface';
import { GetServerInfoResponse } from 'src/dto/server.dto';

@ApiTags('Info')
@Controller('info')
@UsePipes(new ValidationPipe({ transform: true }))
export class ServerInfoController {
  constructor(
    @Inject('SERVER_PROVIDER')
    private serverProvider: IServerProvider,
  ) {}

  @Get('')
  @ApiEndpoint({
    description: 'Get server info',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Server Info',
        type: GetServerInfoResponse,
      },
    ],
  })
  async getInfo(): Promise<GetServerInfoResponse> {
    return this.serverProvider.getInfo();
  }

  @Get('/cli-unsupported-commands')
  @ApiEndpoint({
    description: 'Get list of unsupported commands in CLI',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Unsupported commands',
        type: String,
        isArray: true,
      },
    ],
  })
  async getCliUnsupportedCommands(): Promise<string[]> {
    return getUnsupportedCommands();
  }

  @Get('/cli-blocking-commands')
  @ApiEndpoint({
    description: 'Get list of blocking commands in CLI',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Blocking commands',
        type: String,
        isArray: true,
      },
    ],
  })
  async getCliBlockingCommands(): Promise<string[]> {
    return getBlockingCommands();
  }
}
