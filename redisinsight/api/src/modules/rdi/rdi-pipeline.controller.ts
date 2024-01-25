import {
  Body,
  ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { Rdi, RdiPipeline, RdiClientMetadata } from 'src/modules/rdi/models';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RdiPipelineService } from 'src/modules/rdi/rdi-pipeline.service';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { RdiDryRunJobDto } from 'src/modules/rdi/dto';
import { RdiDryRunJobResponseDto } from 'src/modules/rdi/dto/rdi.dry-run.job.response.dto';

@ApiTags('RDI')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('rdi/:id/pipeline')
export class RdiPipelineController {
  constructor(
    private readonly rdiPipelineService: RdiPipelineService,
  ) {}

  @Get('/schema')
  @ApiEndpoint({
    description: 'Get pipeline schema',
    responses: [{ status: 200, type: Rdi }],
  })
  async getSchema(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<object> {
    return this.rdiPipelineService.getSchema(rdiClientMetadata);
  }

  @Get('/')
  @ApiEndpoint({
    description: 'Get pipeline',
    responses: [{ status: 200, type: RdiPipeline }],
  })
  async getPipeline(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<object> {
    return this.rdiPipelineService.getPipeline(rdiClientMetadata);
  }

  @Post('/dry-run-job')
  @ApiEndpoint({
    description: 'Dry run job',
    responses: [{ status: 200, type: RdiDryRunJobResponseDto }],
  })
  async dryRunJob(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
      @Body() dto: RdiDryRunJobDto,
  ): Promise<RdiDryRunJobResponseDto> {
    return this.rdiPipelineService.dryRunJob(rdiClientMetadata, dto);
  }

  @Post('/deploy')
  @ApiEndpoint({
    description: 'Deploy the pipeline',
    responses: [{ status: 200, type: RdiPipeline }],
  })
  async deploy(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
      @Body() dto: RdiPipeline,
  ): Promise<void> {
    return this.rdiPipelineService.deploy(rdiClientMetadata, dto);
  }
}
