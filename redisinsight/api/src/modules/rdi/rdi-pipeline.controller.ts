import {
  ClassSerializerInterceptor, Controller, Get, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { Rdi, RdiPipeline, RdiClientMetadata } from 'src/modules/rdi/models';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RdiPipelineService } from 'src/modules/rdi/rdi-pipeline.service';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';

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
}
