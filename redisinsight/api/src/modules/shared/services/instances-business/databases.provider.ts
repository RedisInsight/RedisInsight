import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { EncryptionService } from 'src/modules/core/encryption/encryption.service';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Injectable()
export class DatabasesProvider {
  protected logger = new Logger('DatabaseProvider');

  constructor(
    @InjectRepository(DatabaseEntity)
    protected readonly databasesRepository: Repository<DatabaseEntity>,
    protected readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Fast check if database exists.
   * No need to retrieve any fields.
   * @param id
   */
  async exists(id: string): Promise<boolean> {
    return !!await this.databasesRepository
      .createQueryBuilder('database')
      .where({ id })
      .select(['database.id'])
      .getOne();
  }

  /**
   * Get list of databases from the local db
   * Temporary this method will decrypt database entity fields
   * todo: remove decryption here and exclude passwords from the databases list response
   */
  async getAll(): Promise<DatabaseEntity[]> {
    this.logger.log('Getting databases list');
    const entities = await this.databasesRepository
      .createQueryBuilder('database')
      .select(['database', 'caCert.id', 'caCert.name', 'clientCert.id', 'clientCert.name'])
      .leftJoin('database.caCert', 'caCert')
      .leftJoin('database.clientCert', 'clientCert')
      .getMany();

    this.logger.log('Succeed to get databases entities');

    return Promise.all(
      entities.map<Promise<DatabaseEntity>>((entity) => this.decryptEntity(entity, true)),
    );
  }

  /**
   * Get single database by id from the local db
   * @throws NotFoundException in case when no database found
   */
  async getOneById(
    id: string,
    ignoreEncryptionErrors: boolean = false,
  ): Promise<DatabaseEntity> {
    this.logger.log(`Getting database ${id}`);

    const entity = await this.databasesRepository
      .createQueryBuilder('database')
      .where({ id })
      .select(['database', 'caCert.id', 'caCert.name', 'clientCert.id', 'clientCert.name'])
      .leftJoin('database.caCert', 'caCert')
      .leftJoin('database.clientCert', 'clientCert')
      .getOne();

    if (!entity) {
      this.logger.error(`Database with ${id} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.INVALID_DATABASE_INSTANCE_ID);
    }

    this.logger.log(`Succeed to get database ${id}`);

    return this.decryptEntity(entity, ignoreEncryptionErrors);
  }

  /**
   * Encrypt database and save entire entity
   * Should always throw and error in case when unable to encrypt for some reason
   * @param database
   */
  async save(database: DatabaseEntity): Promise<DatabaseEntity> {
    return this.decryptEntity(
      await this.databasesRepository.save(await this.encryptEntity(database)),
    );
  }

  /**
   * This method is needed to fast update database field(s) without care about encryption logic
   * Updating fields that require encryption is deprecated use "update" method instead
   *
   * @param id
   * @param data
   * @throws BadRequestException error when try to update password or sentinelMasterPassword fields
   */
  async patch(id: string, data: QueryDeepPartialEntity<DatabaseEntity>) {
    if (data.password !== undefined || data.sentinelMasterPassword !== undefined) {
      throw new BadRequestException('Deprecated to update password fields here');
    }

    return this.databasesRepository.update(id, data);
  }

  /**
   * Update entire database entity with fields encryption logic
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param id
   * @param data
   */
  async update(id: string, data: DatabaseEntity) {
    return this.databasesRepository.update(id, await this.encryptEntity(data));
  }

  /**
   * Encrypt required database fields based on picked encryption strategy
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param entity
   * @private
   */
  private async encryptEntity(entity: DatabaseEntity): Promise<DatabaseEntity> {
    let password = null;
    let sentinelMasterPassword = null;
    let encryption = null;

    if (entity.password) {
      const encryptionResult = await this.encryptionService.encrypt(entity.password);
      password = encryptionResult.data;
      encryption = encryptionResult.encryption;
    }

    if (entity.sentinelMasterPassword) {
      const encryptionResult = await this.encryptionService.encrypt(entity.sentinelMasterPassword);
      sentinelMasterPassword = encryptionResult.data;
      encryption = encryptionResult.encryption;
    }

    return {
      ...entity,
      password,
      sentinelMasterPassword,
      encryption,
    };
  }

  /**
   * Decrypt required database fields (password, sentinelMasterPassword)
   * This method should optionally not fail (to not block users to navigate across app
   * on decryption error, for example, to be able change encryption strategy in the future)
   *
   * When ignoreErrors = true will return null for failed fields.
   * It will cause 401 Unauthorized errors when user tries to connect to redis database
   *
   * @param entity
   * @param ignoreErrors
   * @private
   */
  private async decryptEntity(
    entity: DatabaseEntity,
    ignoreErrors: boolean = false,
  ): Promise<DatabaseEntity> {
    let password = null;
    let sentinelMasterPassword = null;

    try {
      password = await this.encryptionService.decrypt(entity.password, entity.encryption);
      sentinelMasterPassword = await this.encryptionService.decrypt(
        entity.sentinelMasterPassword,
        entity.encryption,
      );
    } catch (error) {
      this.logger.error(`Unable to decrypt database ${entity.id} fields`, error);
      if (!ignoreErrors) {
        throw error;
      }
    }

    return {
      ...entity,
      password,
      sentinelMasterPassword,
    };
  }
}
