import {
  Body,
  Controller,
  Get, HttpCode,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ApiQueryRedisStringEncoding, BrowserClientMetadata } from 'src/common/decorators';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import {
  CreateRedisearchIndexDto,
  ListRedisearchIndexesResponse,
  SearchRedisearchDto,
} from 'src/modules/browser/dto/redisearch';
import { RedisearchService } from 'src/modules/browser/services/redisearch/redisearch.service';
import { GetKeysWithDetailsResponse } from 'src/modules/browser/dto';
import { ClientMetadata } from 'src/common/models';

@ApiTags('RediSearch')
@Controller('redisearch')
export class RedisearchController extends BaseController {
  constructor(private service: RedisearchService) {
    super();
  }

  @Get('')
  @ApiOperation({ description: 'Get list of available indexes' })
  @ApiOkResponse({ type: ListRedisearchIndexesResponse })
  @ApiRedisParams()
  @ApiQueryRedisStringEncoding()
  async list(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<ListRedisearchIndexesResponse> {
    return this.service.list(clientMetadata);
  }

  @Post('')
  @ApiOperation({ description: 'Create redisearch index' })
  @ApiRedisParams()
  @HttpCode(201)
  @ApiBody({ type: CreateRedisearchIndexDto })
  async createIndex(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: CreateRedisearchIndexDto,
  ): Promise<void> {
    return await this.service.createIndex(clientMetadata, dto);
  }

  @Post('search')
  @HttpCode(200)
  @ApiOperation({ description: 'Search for keys in index' })
  @ApiOkResponse({ type: GetKeysWithDetailsResponse })
  @ApiRedisParams()
  @ApiQueryRedisStringEncoding()
  async search(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
      @Body() dto: SearchRedisearchDto,
  ): Promise<GetKeysWithDetailsResponse> {
    return await this.service.search(clientMetadata, dto);
  }
}
