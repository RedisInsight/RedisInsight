import {
  ClassSerializerInterceptor,
  Controller, Post, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';

@ApiTags('Cloud Databases')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me/databases')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudDatabaseController {
  constructor(
    private readonly service: CloudDatabaseCapiService,
  ) {}

  @Post('/free')
  @ApiEndpoint({
    description: 'Create free database for current account',
    statusCode: 200,
    // responses: [{ type: CloudTask? }],
  })
  async createFreeDatabase(
    @RequestSessionMetadata() sessionMetadata,
  ): Promise<any> {
    return this.service.createFreeDatabase(sessionMetadata);
  }
}
