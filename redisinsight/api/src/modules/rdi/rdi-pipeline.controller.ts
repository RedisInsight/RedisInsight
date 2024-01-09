import {
  Body,
  ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { Rdi, RdiPipeline, RdiClientMetadata } from 'src/modules/rdi/models';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RdiPipelineService } from 'src/modules/rdi/rdi-pipeline.service';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { DryRunJobDto } from 'src/modules/rdi/dto';
import { DryRunJobResponseDto } from 'src/modules/rdi/dto/dry-run.job.response.dto';

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
    responses: [{ status: 200, type: DryRunJobResponseDto }],
  })
  async dryRunJob(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
      @Body() dto: DryRunJobDto,
  ): Promise<DryRunJobResponseDto> {
    return this.rdiPipelineService.dryRunJob(rdiClientMetadata, dto);
  }
}
