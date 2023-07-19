import {
  Body, Query,
  ClassSerializerInterceptor,
  Controller, Get, Param, Post, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { Validator } from 'class-validator';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudJobService } from 'src/modules/cloud/job/cloud-job.service';
import { CreateCloudJobDto } from 'src/modules/cloud/job/dto';
import { CloudJobInfo } from 'src/modules/cloud/job/models';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';
import { plainToClass } from 'class-transformer';

@ApiTags('Cloud Jobs')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me/jobs')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudJobController {
  private readonly validator = new Validator();

  private exceptionFactory = (new ValidationPipe()).createExceptionFactory();

  constructor(
    private readonly service: CloudJobService,
  ) {}

  @Post('/')
  @ApiEndpoint({
    description: 'Create cloud job',
    statusCode: 200,
    responses: [{ type: CloudJobInfo }],
  })
  async createFreeDatabase(
    @RequestSessionMetadata() sessionMetadata,
      @Body() data: CreateCloudJobDto,
      @Query() utm: CloudRequestUtm,
  ): Promise<CloudJobInfo> {
    const dto = plainToClass(CreateCloudJobDto, data);

    const errors = await this.validator.validate(
      dto,
      { whitelist: true },
    );

    if (errors?.length) {
      throw this.exceptionFactory(errors);
    }
    return this.service.create(sessionMetadata, data, utm);
  }

  @Get('/')
  @ApiEndpoint({
    description: 'Get list of user jobs',
    statusCode: 200,
    responses: [{ type: CloudJobInfo, isArray: true }],
  })
  async getUserJobsInfo(
    @RequestSessionMetadata() sessionMetadata,
  ): Promise<CloudJobInfo[]> {
    return this.service.getUserJobsInfo(sessionMetadata);
  }

  @Get('/:id')
  @ApiEndpoint({
    description: 'Get user jobs',
    statusCode: 200,
    responses: [{ type: CloudJobInfo }],
  })
  async getJobInfo(
    @RequestSessionMetadata() sessionMetadata,
      @Param('id') id: string,
  ): Promise<CloudJobInfo> {
    return this.service.getJobInfo(sessionMetadata, id);
  }
}
