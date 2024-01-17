import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  difference,
  isEmpty,
  map,
  cloneDeep,
} from 'lodash';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';
import config, { Config } from 'src/utils/config';
import { AgreementIsNotDefinedException } from 'src/constants';
import { KeytarEncryptionStrategy } from 'src/modules/encryption/strategies/keytar-encryption.strategy';
import { KeyEncryptionStrategy } from 'src/modules/encryption/strategies/key-encryption.strategy';
import { SettingsAnalytics } from 'src/modules/settings/settings.analytics';
import { SettingsRepository } from 'src/modules/settings/repositories/settings.repository';
import { classToClass } from 'src/utils';
import { AgreementsRepository } from 'src/modules/settings/repositories/agreements.repository';
import { FeatureServerEvents } from 'src/modules/feature/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GetAgreementsSpecResponse, GetAppSettingsResponse, UpdateSettingsDto } from './dto/settings.dto';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export class SettingsService {
  private logger = new Logger('SettingsService');

  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly agreementRepository: AgreementsRepository,
    private readonly analytics: SettingsAnalytics,
    private readonly keytarEncryptionStrategy: KeytarEncryptionStrategy,
    private readonly keyEncryptionStrategy: KeyEncryptionStrategy,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Method to get settings
   */
  public async getAppSettings(userId: string): Promise<GetAppSettingsResponse> {
    this.logger.log('Getting application settings.');
    try {
      const agreements = await this.agreementRepository.getOrCreate(userId);
      const settings = await this.settingsRepository.getOrCreate(userId);
      this.logger.log('Succeed to get application settings.');
      return classToClass(GetAppSettingsResponse, {
        ...settings?.data,
        agreements: agreements?.version ? {
          ...agreements?.data,
          version: agreements?.version,
        } : null,
      });
    } catch (error) {
      this.logger.error('Failed to get application settings.', error);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Method to update application settings and agreements
   * @param dto
   * @param userId
   */
  public async updateAppSettings(
    userId: string,
    dto: UpdateSettingsDto,
  ): Promise<GetAppSettingsResponse> {
    this.logger.log('Updating application settings.');
    const { agreements, ...settings } = dto;
    try {
      const oldAppSettings = await this.getAppSettings(userId);
      if (!isEmpty(settings)) {
        const model = await this.settingsRepository.getOrCreate(userId);
        const toUpdate = {
          ...model,
          data: {
            ...model?.data,
            ...settings,
          },
        };

        await this.settingsRepository.update(userId, toUpdate);
      }
      if (agreements) {
        await this.updateAgreements(userId, agreements);
      }
      this.logger.log('Succeed to update application settings.');
      const results = await this.getAppSettings(userId);
      this.analytics.sendSettingsUpdatedEvent(results, oldAppSettings);

      this.eventEmitter.emit(FeatureServerEvents.FeaturesRecalculate);

      return results;
    } catch (error) {
      this.logger.error('Failed to update application settings.', error);
      if (
        error instanceof AgreementIsNotDefinedException
        || error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  /**
   * Call for current system's state check for conditional agreements spec
   * @param checker
   * @param defaultOption
   * @private
   */
  private async getAgreementsOption(checker: string, defaultOption: string): Promise<string> {
    try {
      // Check if any encryption strategy is available (not KEYTAR only)
      // KEY has a precedence on KEYTAR strategy
      if (checker === 'KEYTAR') {
        const isEncryptionAvailable = await this.keyEncryptionStrategy.isAvailable()
          || await this.keytarEncryptionStrategy.isAvailable();

        if (!isEncryptionAvailable && SERVER_CONFIG.buildType === 'REDIS_STACK') {
          return 'stack_false';
        }

        return `${isEncryptionAvailable}`;
      }
    } catch (e) {
      this.logger.error(`Unable to proceed agreements checker ${checker}`);
    }

    return defaultOption;
  }

  /**
   * Process conditional agreements where needed and returns proper agreements spec
   */
  public async getAgreementsSpec(): Promise<GetAgreementsSpecResponse> {
    const agreementsSpec = cloneDeep<any>(AGREEMENTS_SPEC);

    await Promise.all(map(agreementsSpec.agreements, async (agreement: any, name) => {
      if (agreement.conditional) {
        const option = await this.getAgreementsOption(agreement.checker, agreement.defaultOption);
        agreementsSpec.agreements[name] = agreement.options[option];
      }
    }));

    return agreementsSpec;
  }

  private async updateAgreements(
    userId: string,
    dtoAgreements: Map<string, boolean> = new Map(),
  ): Promise<void> {
    this.logger.log('Updating application agreements.');
    const oldAgreements = await this.agreementRepository.getOrCreate(userId);

    const newAgreements = {
      ...oldAgreements,
      version: AGREEMENTS_SPEC.version,
      data: {
        ...oldAgreements.data,
        ...Object.fromEntries(dtoAgreements),
      },
    };

    // Detect which agreements should be defined according to the settings specification
    const diff = difference(
      Object.keys(AGREEMENTS_SPEC.agreements),
      Object.keys(newAgreements.data),
    );
    if (diff.length) {
      const messages = diff.map(
        (item: string) => `agreements.${item} should not be null or undefined`,
      );
      throw new AgreementIsNotDefinedException(messages);
    }

    await this.agreementRepository.update(userId, newAgreements);

    if (dtoAgreements.has('analytics')) {
      this.analytics.sendAnalyticsAgreementChange(
        dtoAgreements,
        new Map(Object.entries(oldAgreements.data || {})),
      );
    }
  }
}
