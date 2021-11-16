import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import {
  GetAgreementsSpecResponse,
  GetAppSettingsResponse,
  UpdateSettingsDto,
} from '../dto/settings.dto';

@ApiTags('Settings')
@Controller('settings')
@UsePipes(new ValidationPipe({ transform: true }))
export class SettingsController {
  constructor(
    @Inject('SETTINGS_PROVIDER')
    private settingsService: ISettingsProvider,
  ) {}

  @Get('')
  @ApiEndpoint({
    description: 'Get info about application settings',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Application settings',
        type: GetAppSettingsResponse,
      },
    ],
  })
  async getSettings(): Promise<GetAppSettingsResponse> {
    return this.settingsService.getSettings();
  }

  @Get('/agreements/spec')
  @ApiEndpoint({
    description: 'Get json with agreements specification',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Agreements specification',
        type: GetAgreementsSpecResponse,
      },
    ],
  })
  async getAgreementsSpec(): Promise<GetAgreementsSpecResponse> {
    return this.settingsService.getAgreementsSpec();
  }

  @Patch('')
  @ApiEndpoint({
    description: 'Update user application settings and agreements',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Application settings',
        type: GetAppSettingsResponse,
      },
    ],
  })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async update(
    @Body() dto: UpdateSettingsDto,
  ): Promise<GetAppSettingsResponse> {
    return this.settingsService.updateSettings(dto);
  }
}
