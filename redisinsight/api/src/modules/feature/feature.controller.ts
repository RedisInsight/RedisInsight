import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { FeatureService } from 'src/modules/feature/feature.service';

@ApiTags('Info')
@Controller('features')
@UsePipes(new ValidationPipe({ transform: true }))
export class FeatureController {
  constructor(
    private featureService: FeatureService,
  ) {}

  @Get('')
  @ApiEndpoint({
    description: 'Get list of features',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Get list of features',
      },
    ],
  })
  async list(): Promise<any> {
    return this.featureService.list();
  }
}
