import {
  GetAgreementsSpecResponse,
  GetAppSettingsResponse,
  UpdateSettingsDto,
} from 'src/dto/settings.dto';

export interface ISettingsProvider {
  getSettings(): Promise<GetAppSettingsResponse>;

  updateSettings(dto: UpdateSettingsDto): Promise<GetAppSettingsResponse>;

  getAgreementsSpec(): Promise<GetAgreementsSpecResponse>;
}
