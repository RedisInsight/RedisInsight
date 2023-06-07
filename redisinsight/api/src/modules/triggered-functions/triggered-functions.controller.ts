import {
  Get,
  Controller, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import { TriggeredFunctionsService } from 'src/modules/triggered-functions/triggered-functions.service';
import { GetTriggeredFunctionsDto } from 'src/modules/triggered-functions/dto';
import { PublishResponse } from 'src/modules/pub-sub/dto/publish.response';
import { ClientMetadata } from 'src/common/models';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';

@ApiTags('Triggered Functions')
@Controller('triggered-functions')
@UsePipes(new ValidationPipe())
export class TriggeredFunctionsController {
  constructor(private service: TriggeredFunctionsService) {}

  @Get('')
  @ApiRedisInstanceOperation({
    description: 'Returns libraries',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns libraries',
        type: PublishResponse,
      },
    ],
  })
  async list(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<GetTriggeredFunctionsDto> {
    return this.service.list(clientMetadata);
  }
}
