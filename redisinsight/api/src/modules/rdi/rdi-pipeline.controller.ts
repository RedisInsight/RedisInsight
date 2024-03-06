import {
  Body,
  ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors, UsePipes, ValidationPipe,
  Query,
} from '@nestjs/common';
import { Rdi, RdiPipeline, RdiClientMetadata } from 'src/modules/rdi/models';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RdiPipelineService } from 'src/modules/rdi/rdi-pipeline.service';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { RdiDryRunJobDto, RdiTestConnectionResult } from 'src/modules/rdi/dto';
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

  @Post('/test-connections')
  @ApiEndpoint({
    description: 'Test target connections',
    responses: [{ status: 200, type: RdiTestConnectionResult }],
  })
  async testConnections(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
      @Body() config: string,
  ): Promise<RdiTestConnectionResult> {
    return this.rdiPipelineService.testConnections(rdiClientMetadata, config);
  }

  @Get('/strategies')
  @ApiEndpoint({
    description: 'Get pipeline strategies and db types for template',
    responses: [{ status: 200, type: Rdi }],
  })
  async getStrategies(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<object> {
    return this.rdiPipelineService.getStrategies(rdiClientMetadata);
  }

  @Get('/template')
  @ApiEndpoint({
    description: 'Get pipeline template for selected pipeline type',
    responses: [{ status: 200, type: Rdi }],
  })
  async getTemplate(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
      @Query() options: object,
  ): Promise<unknown> {
    return this.rdiPipelineService.getTemplate(rdiClientMetadata, options);
  }
}
