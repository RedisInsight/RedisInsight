import {
  Body,
  ClassSerializerInterceptor,
  Controller, Post, UseInterceptors, UsePipes, ValidationPipe
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudJobService } from 'src/modules/cloud/job/cloud-job.service';
import { CreateCloudJobDto } from 'src/modules/cloud/job/dto';
import { CloudJobInfo } from 'src/modules/cloud/job/models';

@ApiTags('Cloud Jobs')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me/jobs')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudJobController {
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
      @Body() dto: CreateCloudJobDto,
  ): Promise<CloudJobInfo> {
    return this.service.create(sessionMetadata, dto);
  }
}
