import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  difference,
  isEmpty,
  map,
  cloneDeep,
} from 'lodash';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';
import config from 'src/utils/config';
import { AgreementIsNotDefinedException } from 'src/constants';
import { GetAgreementsSpecResponse, GetAppSettingsResponse, UpdateSettingsDto } from 'src/dto/settings.dto';
import { AgreementsEntity, IAgreementsJSON } from 'src/modules/core/models/agreements.entity';
import { ISettingsJSON, SettingsEntity } from 'src/modules/core/models/settings.entity';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import { KeytarEncryptionStrategy } from 'src/modules/core/encryption/strategies/keytar-encryption.strategy';
import { AgreementsRepository } from '../../repositories/agreements.repository';
import { SettingsRepository } from '../../repositories/settings.repository';
import { SettingsAnalyticsService } from '../../services/settings-analytics/settings-analytics.service';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const SERVER_CONFIG = config.get('server');
const WORKBENCH_CONFIG = config.get('workbench');

@Injectable()
export class SettingsOnPremiseService
implements OnModuleInit, ISettingsProvider {
  private logger = new Logger('SettingsOnPremiseService');

  private agreementRepository: AgreementsRepository;

  private settingsRepository: SettingsRepository;

  private analyticsService: SettingsAnalyticsService;

  private keytarEncryptionStrategy: KeytarEncryptionStrategy;

  constructor(agreementRepository, settingsRepository, analyticsService, keytarEncryptionStrategy) {
    this.agreementRepository = agreementRepository;
    this.settingsRepository = settingsRepository;
    this.analyticsService = analyticsService;
    this.keytarEncryptionStrategy = keytarEncryptionStrategy;
  }

  async onModuleInit() {
    await this.upsertSettings();
  }

  private async upsertSettings() {
    const agreementsEntity = await this.agreementRepository.findOne();
    const settingsEntity = await this.settingsRepository.findOne();
    if (!agreementsEntity) {
      const agreements: AgreementsEntity = this.agreementRepository.create({});
      await this.agreementRepository.save(agreements);
    }
    if (!settingsEntity) {
      const settings: SettingsEntity = this.settingsRepository.create({});
      await this.settingsRepository.save(settings);
    }
  }

  /**
   * Method to get settings
   */
  public async getSettings(): Promise<GetAppSettingsResponse> {
    this.logger.log('Getting application settings.');
    try {
      const agreements: IAgreementsJSON = (
        await this.agreementRepository.findOne()
      ).toJSON();
      const settings: ISettingsJSON = (
        await this.settingsRepository.findOne()
      ).toJSON();
      this.logger.log('Succeed to get application settings.');
      return {
        ...settings,
        scanThreshold: settings.scanThreshold || REDIS_SCAN_CONFIG.countThreshold,
        pipelineBunch: typeof(settings.pipelineBunch) === "number" ? settings.pipelineBunch : WORKBENCH_CONFIG.countBunch,
        agreements: agreements.version ? agreements : null,
      };
    } catch (error) {
      this.logger.error('Failed to get application settings.', error);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Method to update application settings and agreements
   * @param dto
   */
  public async updateSettings(
    dto: UpdateSettingsDto,
  ): Promise<GetAppSettingsResponse> {
    this.logger.log('Updating application settings.');
    const { agreements, ...settings } = dto;
    try {
      const oldSettings = await this.getSettings();
      if (!isEmpty(settings)) {
        const entity: SettingsEntity = await this.settingsRepository.findOne();

        entity.data = JSON.stringify({
          ...entity.toJSON(),
          ...settings,
        });
        await this.settingsRepository.save(entity);
      }
      if (agreements) {
        await this.updateAgreements(dto.agreements);
      }
      this.logger.log('Succeed to update application settings.');
      const results = await this.getSettings();
      this.analyticsService.sendSettingsUpdatedEvent(results, oldSettings);
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
      if (checker === 'KEYTAR') {
        const isEncryptionAvailable = await this.keytarEncryptionStrategy.isAvailable();

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
    dtoAgreements: Map<string, boolean> = new Map(),
  ): Promise<void> {
    this.logger.log('Updating application agreements.');
    const entity: AgreementsEntity = await this.agreementRepository.findOne();
    const oldAgreements = JSON.parse(entity.data);
    const newValue = {
      ...oldAgreements,
      ...Object.fromEntries(dtoAgreements),
    };
    // Detect which agreements should be defined according to the settings specification
    const diff = difference(
      Object.keys(AGREEMENTS_SPEC.agreements),
      Object.keys(newValue),
    );
    if (diff.length) {
      const messages = diff.map(
        (item: string) => `agreements.${item} should not be null or undefined`,
      );
      throw new AgreementIsNotDefinedException(messages);
    }
    entity.data = JSON.stringify(newValue);
    entity.version = AGREEMENTS_SPEC.version;
    await this.agreementRepository.save(entity);
    if (dtoAgreements.has('analytics')) {
      this.analyticsService.sendAnalyticsAgreementChange(
        dtoAgreements,
        new Map(Object.entries({ ...oldAgreements })),
      );
    }
  }
}
