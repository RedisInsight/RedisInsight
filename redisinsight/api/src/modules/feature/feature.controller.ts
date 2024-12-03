import {
  Controller,
  Get,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { FeatureService } from 'src/modules/feature/feature.service';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';
import LoggerService from 'src/modules/logger/logger.service';

@ApiTags('Info')
@Controller('features')
@UsePipes(new ValidationPipe({ transform: true }))
export class FeatureController {
  constructor(
    private featureService: FeatureService,
    private featuresConfigService: FeaturesConfigService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('FeatureController');
  }

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
  async list(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<any> {
    // this.logger.log('custom logger in features controller!', { foo: 'bar' });
    return this.featureService.list(sessionMetadata);
  }

  @Post('/sync')
  @HttpCode(200)
  async sync(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<void> {
    return this.featuresConfigService.sync(sessionMetadata);
  }
}
