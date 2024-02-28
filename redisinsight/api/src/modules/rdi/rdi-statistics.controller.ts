import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import { RdiStatisticsService } from 'src/modules/rdi/rdi-statistics.service';
import { RdiStatisticsResult } from 'src/modules/rdi/dto';
import { CamelCaseInterceptor } from 'src/common/interceptors/camel-case.interceptor';

@ApiTags('RDI')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(CamelCaseInterceptor)
@Controller('rdi/:id/statistics')
export class RdiStatisticsController {
  constructor(
    private readonly rdiStatisticsService: RdiStatisticsService,
  ) {}

  @Get('/')
  @ApiEndpoint({
    description: 'Get statistics',
    responses: [{ status: 200, type: RdiStatisticsResult }],
  })
  async getStatistics(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<RdiStatisticsResult> {
    return this.rdiStatisticsService.getStatistics(rdiClientMetadata);
  }
}
