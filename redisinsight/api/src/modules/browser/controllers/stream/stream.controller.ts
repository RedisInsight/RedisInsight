import {
  Body,
  Controller,
  Delete,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import {
  AddStreamEntriesDto, AddStreamEntriesResponse,
  CreateStreamDto,
  GetStreamEntriesDto,
  GetStreamEntriesResponse,
  DeleteStreamEntriesDto,
  DeleteStreamEntriesResponse,
} from 'src/modules/browser/dto/stream.dto';
import { StreamService } from 'src/modules/browser/services/stream/stream.service';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { ApiQueryRedisStringEncoding, BrowserClientMetadata } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';

@ApiTags('Streams')
@Controller('streams')
export class StreamController extends BaseController {
  constructor(private service: StreamService) {
    super();
  }

  @Post('')
  @ApiRedisInstanceOperation({
    description: 'Create stream',
    statusCode: 201,
  })
  async createStream(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: CreateStreamDto,
  ): Promise<void> {
    return this.service.createStream(clientMetadata, dto);
  }

  @Post('entries')
  @ApiRedisInstanceOperation({
    description: 'Add entries to the stream',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns entries IDs added',
        type: AddStreamEntriesResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async addEntries(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: AddStreamEntriesDto,
  ): Promise<AddStreamEntriesResponse> {
    return this.service.addEntries(clientMetadata, dto);
  }

  @Post('/entries/get')
  @ApiRedisInstanceOperation({
    description: 'Get stream entries',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns ordered stream entries in defined range.',
        type: GetStreamEntriesResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getEntries(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetStreamEntriesDto,
  ): Promise<GetStreamEntriesResponse> {
    return this.service.getEntries(clientMetadata, dto);
  }

  @Delete('/entries')
  @ApiRedisInstanceOperation({
    description: 'Remove the specified entries from the Stream stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: DeleteStreamEntriesResponse,
      },
    ],
  })
  async deleteEntries(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: DeleteStreamEntriesDto,
  ): Promise<DeleteStreamEntriesResponse> {
    return await this.service.deleteEntries(clientMetadata, dto);
  }
}
