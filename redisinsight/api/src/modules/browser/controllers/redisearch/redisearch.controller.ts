import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { BaseController } from 'src/modules/browser/controllers/base.controller';
import { CreateRedisearchIndexDto } from 'src/modules/browser/dto/redisearch';
import { RedisearchService } from 'src/modules/browser/services/redisearch/redisearch.service';

@ApiTags('RediSearch')
@Controller('redisearch')
export class RedisearchController extends BaseController {
  constructor(private service: RedisearchService) {
    super();
  }

  @Get('')
  @ApiOperation({ description: 'Get list of available indexes' })
  @ApiRedisParams()
  @ApiQueryRedisStringEncoding()
  async list(
    @Param('dbInstance') dbInstance: string,
  ): Promise<any> {
    return await this.service.list(
      {
        instanceId: dbInstance,
      },
    );
  }

  @Post('')
  @ApiOperation({ description: 'Create redisearch index' })
  @ApiRedisParams()
  @ApiBody({ type: CreateRedisearchIndexDto })
  async createList(
    @Param('dbInstance') dbInstance: string,
      @Body() dto: CreateRedisearchIndexDto,
  ): Promise<void> {
    return await this.service.createIndex(
      {
        instanceId: dbInstance,
      },
      dto,
    );
  }
}
