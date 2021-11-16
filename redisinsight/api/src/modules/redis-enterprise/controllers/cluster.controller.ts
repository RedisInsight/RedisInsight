import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { TimeoutInterceptor } from 'src/modules/core/interceptors/timeout.interceptor';
import {
  RedisEnterpriseBusinessService,
} from 'src/modules/shared/services/redis-enterprise-business/redis-enterprise-business.service';
import {
  RedisEnterpriseDatabase,
  ClusterConnectionDetailsDto,
} from '../dto/cluster.dto';

@ApiTags('Redis Enterprise Cluster')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('cluster')
export class ClusterController {
  constructor(private redisEnterpriseService: RedisEnterpriseBusinessService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('get-dbs')
  @UseInterceptors(new TimeoutInterceptor())
  @ApiEndpoint({
    description: 'Get all databases in the cluster.',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'All databases in the cluster.',
        isArray: true,
        type: RedisEnterpriseDatabase,
      },
    ],
  })
  async getDatabases(
    @Body() dto: ClusterConnectionDetailsDto,
  ): Promise<RedisEnterpriseDatabase[]> {
    return await this.redisEnterpriseService.getDatabases(dto);
  }
}
