import {
  Body,
  Controller, Delete,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import {
  AckPendingEntriesDto, AckPendingEntriesResponse, ClaimPendingEntriesResponse, ClaimPendingEntryDto,
  ConsumerDto,
  ConsumerGroupDto, DeleteConsumersDto,
  GetConsumersDto, GetPendingEntriesDto, PendingEntryDto,
} from 'src/modules/browser/dto/stream.dto';
import { ConsumerService } from 'src/modules/browser/services/stream/consumer.service';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { ApiQueryRedisStringEncoding, BrowserClientMetadata } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';

@ApiTags('Streams')
@Controller('streams/consumer-groups/consumers')
export class ConsumerController extends BaseController {
  constructor(private service: ConsumerService) {
    super();
  }

  @Post('/get')
  @ApiRedisInstanceOperation({
    description: 'Get consumers list in the group',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: ConsumerGroupDto,
        isArray: true,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getConsumers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetConsumersDto,
  ): Promise<ConsumerDto[]> {
    return this.service.getConsumers(clientMetadata, dto);
  }

  @Delete('')
  @ApiRedisInstanceOperation({
    description: 'Delete Consumer(s) from the Consumer Group',
    statusCode: 200,
  })
  async deleteConsumers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: DeleteConsumersDto,
  ): Promise<void> {
    return this.service.deleteConsumers(clientMetadata, dto);
  }

  @Post('/pending-messages/get')
  @ApiRedisInstanceOperation({
    description: 'Get pending entries list',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: PendingEntryDto,
        isArray: true,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getPendingEntries(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: GetPendingEntriesDto,
  ): Promise<PendingEntryDto[]> {
    return this.service.getPendingEntries(clientMetadata, dto);
  }

  @Post('/pending-messages/ack')
  @ApiRedisInstanceOperation({
    description: 'Ack pending entries',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: AckPendingEntriesResponse,
      },
    ],
  })
  async ackPendingEntries(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: AckPendingEntriesDto,
  ): Promise<AckPendingEntriesResponse> {
    return this.service.ackPendingEntries(clientMetadata, dto);
  }

  @Post('/pending-messages/claim')
  @ApiRedisInstanceOperation({
    description: 'Claim pending entries',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: ClaimPendingEntriesResponse,
      },
    ],
  })
  async claimPendingEntries(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: ClaimPendingEntryDto,
  ): Promise<ClaimPendingEntriesResponse> {
    return this.service.claimPendingEntries(clientMetadata, dto);
  }
}
