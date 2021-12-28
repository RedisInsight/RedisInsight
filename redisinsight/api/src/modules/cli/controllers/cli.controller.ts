import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateCliClientResponse,
  DeleteClientResponse,
  SendClusterCommandResponse,
  SendClusterCommandDto,
  SendCommandDto,
  SendCommandResponse,
  CreateCliClientDto,
} from 'src/modules/cli/dto/cli.dto';
import { CliBusinessService } from 'src/modules/cli/services/cli-business/cli-business.service';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiCLIParams } from 'src/modules/cli/decorators/api-cli-params.decorator';

@ApiTags('CLI')
@Controller('cli')
@UsePipes(new ValidationPipe({ transform: true }))
export class CliController {
  constructor(private service: CliBusinessService) {}

  @Post('')
  @ApiCLIParams(false)
  @ApiEndpoint({
    description: 'Create Redis client for CLI',
    statusCode: 201,
    responses: [
      {
        status: 201,
        description: 'Create Redis client for CLI',
        type: CreateCliClientResponse,
      },
    ],
  })
  async getClient(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: CreateCliClientDto,
  ): Promise<CreateCliClientResponse> {
    return this.service.getClient(dbInstance, dto.namespace);
  }

  @Post('/:uuid/send-command')
  @ApiCLIParams()
  @ApiEndpoint({
    description: 'Send Redis CLI command',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Redis CLI command response',
        type: SendCommandResponse,
      },
    ],
  })
  async sendCommand(
    @Param('dbInstance') dbInstance: string,
      @Param('uuid') uuid: string,
      @Body() dto: SendCommandDto,
  ): Promise<SendCommandResponse> {
    return this.service.sendCommand(
      {
        instanceId: dbInstance,
        uuid,
      },
      dto,
    );
  }

  @Post('/:uuid/send-cluster-command')
  @ApiCLIParams()
  @ApiEndpoint({
    description: 'Send Redis CLI command',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Redis CLI command response',
        type: SendClusterCommandResponse,
        isArray: true,
      },
    ],
  })
  async sendClusterCommand(
    @Param('dbInstance') dbInstance: string,
      @Param('uuid') uuid: string,
      @Body() dto: SendClusterCommandDto,
  ): Promise<SendClusterCommandResponse[]> {
    return this.service.sendClusterCommand(
      {
        instanceId: dbInstance,
        uuid,
      },
      dto,
    );
  }

  @Delete('/:uuid')
  @ApiCLIParams()
  @ApiEndpoint({
    description: 'Delete Redis CLI client',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Delete Redis CLI client response',
        type: DeleteClientResponse,
      },
    ],
  })
  async deleteClient(
    @Param('dbInstance') dbInstance: string,
      @Param('uuid') uuid: string,
  ): Promise<DeleteClientResponse> {
    return this.service.deleteClient(dbInstance, uuid);
  }

  @Patch('/:uuid')
  @ApiCLIParams()
  @ApiEndpoint({
    description: 'Re-create Redis client for CLI',
    statusCode: 200,
  })
  async reCreateClient(
    @Param('dbInstance') dbInstance: string,
      @Param('uuid') uuid: string,
      @Body() dto: CreateCliClientDto,
  ): Promise<CreateCliClientResponse> {
    return this.service.reCreateClient(dbInstance, uuid, dto.namespace);
  }
}
