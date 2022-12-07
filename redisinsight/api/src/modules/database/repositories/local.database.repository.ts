import { Injectable } from '@nestjs/common';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { Database } from 'src/modules/database/models/database';
import { classToClass } from 'src/utils';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';

@Injectable()
export class LocalDatabaseRepository extends DatabaseRepository {
  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(DatabaseEntity)
    private readonly repository: Repository<DatabaseEntity>,
    private readonly caCertificateRepository: CaCertificateRepository,
    private readonly clientCertificateRepository: ClientCertificateRepository,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, ['password', 'sentinelMasterPassword']);
  }

  /**
   * @inheritDoc
   */
  public async exists(id: string): Promise<boolean> {
    return !!await this.repository
      .createQueryBuilder('database')
      .where({ id })
      .select(['database.id'])
      .getOne();
  }

  /**
   * @inheritDoc
   */
  public async get(
    id: string,
    ignoreEncryptionErrors: boolean = false,
  ): Promise<Database> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) {
      return null;
    }
    const model = classToClass(Database, await this.modelEncryptor.decryptEntity(entity, ignoreEncryptionErrors));

    if (entity.caCert) {
      model.caCert = await this.caCertificateRepository.get(entity.caCert.id);
    }

    if (entity.clientCert) {
      model.clientCert = await this.clientCertificateRepository.get(entity.clientCert.id);
    }

    return model;
  }

  /**
   * @inheritDoc
   */
  public async list(): Promise<Database[]> {
    const entities = await this.repository
      .createQueryBuilder('d')
      .select([
        'd.id', 'd.name', 'd.host', 'd.port', 'd.db', 'd.new',
        'd.connectionType', 'd.modules', 'd.lastConnection',
      ])
      .getMany();

    return entities.map((entity) => classToClass(Database, entity));
  }

  /**
   * Create database with encrypted sensitive fields
   * @param database
   */
  public async create(database: Database): Promise<Database> {
    const entity = classToClass(DatabaseEntity, await this.populateCertificates(database));
    return classToClass(
      Database,
      await this.modelEncryptor.decryptEntity(
        await this.repository.save(
          await this.modelEncryptor.encryptEntity(entity),
        ),
      ),
    );
  }

  /**
   * Update database entity with fields encryption logic
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param id
   * @param database
   * @throws TBD
   */
  public async update(id: string, database: Partial<Database>): Promise<Database> {
    const entity = classToClass(DatabaseEntity, await this.populateCertificates(database as Database));
    await this.repository.update(id, await this.modelEncryptor.encryptEntity(entity));
    return this.get(id);
  }

  /**
   * @inheritDoc
   */
  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Get certificates or create certificates if needed
   * TODO: Rethink implementation to avoid possible transaction issues
   * @param database
   * @private
   */
  private async populateCertificates(database: Database): Promise<Database> {
    const model = classToClass(Database, database);

    // fetch ca cert if needed to be able to connect
    if (!model.caCert?.id && model.caCert?.certificate) {
      model.caCert = await this.caCertificateRepository.create(model.caCert);
    }

    // fetch client cert if needed to be able to connect
    if (!model.clientCert?.id && (model.clientCert?.certificate || model.clientCert?.key)) {
      model.clientCert = await this.clientCertificateRepository.create(model.clientCert);
    }

    return model;
  }
}
